###############################################################################
# Portfolio – Static Site Infrastructure
#
# What this provisions:
#   - S3 bucket (private, versioned, encrypted at rest)
#   - Bucket policy allowing CloudFront OAC access only (no public S3 URL)
#   - CloudFront distribution with security-hardened config:
#       · TLS 1.2 minimum, no HTTP
#       · Origin Access Control (OAC) – successor to legacy OAI
#       · Security response headers policy enforced at the CDN edge
#   - GitHub OIDC provider + least-privilege IAM role for GitHub Actions
#     (no long-lived access keys — CI authenticates via short-lived tokens)
#
# Security posture decisions:
#   - Public access to S3 is fully blocked; all traffic goes through CloudFront
#   - Server-side encryption (AES-256) on the bucket
#   - OAC signs requests with SigV4 so S3 rejects any unsigned direct access
#   - HSTS enforced at the CDN edge (max-age 1 year, includeSubDomains)
#   - GitHub Actions authenticates via OIDC — no static IAM credentials stored
#     anywhere; tokens are short-lived and scoped to the exact repo + branch
#   - Deploy role is scoped to S3 sync + CloudFront invalidation only;
#     no IAM self-modification rights, no ability to touch other resources
###############################################################################

terraform {
  required_version = ">= 1.5"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # Remote state – keeps tfstate out of the repo and enables team collaboration.
  # Bucket and DynamoDB table must exist before first `terraform init`.
  backend "s3" {
    bucket         = "portfolio-tfstate-sidsalunke"
    key            = "portfolio/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "portfolio-tfstate-lock"
    encrypt        = true
  }
}

provider "aws" {
  region = var.aws_region
}

# CloudFront is a global service; its ACM certificates must live in us-east-1.
provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"
}

###############################################################################
# Variables
###############################################################################

variable "aws_region" {
  description = "Primary AWS region for S3 and supporting resources"
  type        = string
  default     = "us-east-1"
}

variable "domain_name" {
  description = "Custom domain for the portfolio (e.g. portfolio.sidsalunke.info)"
  type        = string
  default     = "portfolio.sidsalunke.info"
}

variable "acm_certificate_arn" {
  description = "ARN of the ACM certificate covering var.domain_name (must be in us-east-1)"
  type        = string
}

variable "github_repo" {
  description = "GitHub repo in owner/name format (e.g. sidsalunke/serverless-portfolio)"
  type        = string
  default     = "sidsalunke/serverless-portfolio"
}

###############################################################################
# S3 – origin bucket (private)
###############################################################################

resource "aws_s3_bucket" "site" {
  bucket = var.domain_name

  tags = {
    Project     = "portfolio"
    ManagedBy   = "terraform"
  }
}

# Block every form of public S3 access – traffic must come through CloudFront
resource "aws_s3_bucket_public_access_block" "site" {
  bucket = aws_s3_bucket.site.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# Server-side encryption at rest (AES-256 managed by S3)
resource "aws_s3_bucket_server_side_encryption_configuration" "site" {
  bucket = aws_s3_bucket.site.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
    bucket_key_enabled = true
  }
}

# Versioning – enables point-in-time rollback of any file
resource "aws_s3_bucket_versioning" "site" {
  bucket = aws_s3_bucket.site.id
  versioning_configuration {
    status = "Enabled"
  }
}

###############################################################################
# CloudFront – Origin Access Control (OAC)
###############################################################################

resource "aws_cloudfront_origin_access_control" "site" {
  name                              = "${var.domain_name}-oac"
  description                       = "OAC for ${var.domain_name} S3 origin"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

# Security headers policy – enforced at the CDN edge on every response
resource "aws_cloudfront_response_headers_policy" "security" {
  name    = "portfolio-security-headers"
  comment = "Strict security headers for the portfolio static site"

  security_headers_config {
    # Prevents browsers from MIME-sniffing the response content type
    content_type_options {
      override = true
    }

    # Enforces HTTPS for 1 year; instructs browsers to preload the domain
    strict_transport_security {
      access_control_max_age_sec = 31536000
      include_subdomains         = true
      preload                    = true
      override                   = true
    }

    # Prevents the site from being embedded in a frame (clickjacking)
    frame_options {
      frame_option = "DENY"
      override     = true
    }

    # Limits referrer information sent on cross-origin navigation
    referrer_policy {
      referrer_policy = "strict-origin-when-cross-origin"
      override        = true
    }

    # Disables browser features not needed by a static portfolio
    content_security_policy {
      content_security_policy = "default-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data:; connect-src 'none'; frame-ancestors 'none'; base-uri 'self'; form-action 'none'"
      override                = true
    }
  }
}

resource "aws_cloudfront_distribution" "site" {
  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"
  aliases             = [var.domain_name]
  price_class         = "PriceClass_100" # US, Canada, Europe – cheapest tier

  origin {
    domain_name              = aws_s3_bucket.site.bucket_regional_domain_name
    origin_id                = "s3-${var.domain_name}"
    origin_access_control_id = aws_cloudfront_origin_access_control.site.id
  }

  default_cache_behavior {
    target_origin_id       = "s3-${var.domain_name}"
    viewer_protocol_policy = "redirect-to-https" # HTTP → HTTPS, always
    allowed_methods        = ["GET", "HEAD", "OPTIONS"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true

    # Attach our security headers policy to every response
    response_headers_policy_id = aws_cloudfront_response_headers_policy.security.id

    forwarded_values {
      query_string = false
      cookies { forward = "none" }
    }

    # Static assets: cache aggressively; HTML: short TTL so deploys propagate fast
    min_ttl     = 0
    default_ttl = 86400   # 1 day for HTML
    max_ttl     = 2592000 # 30 days for immutable assets
  }

  # Custom error pages – serve index.html for 403/404 (SPA-friendly)
  custom_error_response {
    error_code            = 403
    response_code         = 200
    response_page_path    = "/index.html"
    error_caching_min_ttl = 10
  }

  custom_error_response {
    error_code            = 404
    response_code         = 404
    response_page_path    = "/index.html"
    error_caching_min_ttl = 10
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn      = var.acm_certificate_arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021" # Drops TLS 1.0 and 1.1
  }

  tags = {
    Project   = "portfolio"
    ManagedBy = "terraform"
  }
}

# Allow CloudFront OAC to read objects from the private S3 bucket
data "aws_iam_policy_document" "s3_cloudfront_read" {
  statement {
    sid    = "AllowCloudFrontOACRead"
    effect = "Allow"

    principals {
      type        = "Service"
      identifiers = ["cloudfront.amazonaws.com"]
    }

    actions   = ["s3:GetObject"]
    resources = ["${aws_s3_bucket.site.arn}/*"]

    condition {
      test     = "StringEquals"
      variable = "AWS:SourceArn"
      values   = [aws_cloudfront_distribution.site.arn]
    }
  }
}

resource "aws_s3_bucket_policy" "site" {
  bucket = aws_s3_bucket.site.id
  policy = data.aws_iam_policy_document.s3_cloudfront_read.json

  # Public access block must be in place before the policy is applied
  depends_on = [aws_s3_bucket_public_access_block.site]
}

###############################################################################
# IAM – GitHub Actions OIDC authentication (no long-lived access keys)
#
# How this works:
#   1. GitHub generates a short-lived OIDC token for each workflow run.
#   2. The workflow calls sts:AssumeRoleWithWebIdentity, presenting that token.
#   3. AWS verifies the token against the OIDC provider and issues temporary
#      credentials valid for the duration of the job only.
#   4. The trust policy condition locks the role to a specific repo + branch,
#      so a compromised fork or PR cannot assume this role.
#
# Deploy role permissions (intentionally minimal):
#   s3:PutObject, s3:DeleteObject, s3:ListBucket  – aws s3 sync
#   cloudfront:CreateInvalidation                  – CDN cache purge
#
# Intentionally omitted:
#   s3:GetObject, s3:*Acl, iam:*, s3:DeleteBucket, s3:PutBucketPolicy, etc.
###############################################################################

# Register GitHub's OIDC provider with this AWS account.
# The thumbprint is GitHub's well-known TLS certificate fingerprint, published
# at https://docs.github.com/en/actions/deployment/security-hardening-your-deployments
resource "aws_iam_openid_connect_provider" "github" {
  url             = "https://token.actions.githubusercontent.com"
  client_id_list  = ["sts.amazonaws.com"]

  # SHA-1 thumbprint of the GitHub OIDC TLS certificate.
  # AWS uses this to verify tokens are genuinely from GitHub.
  thumbprint_list = ["6938fd4d98bab03faadb97b34396831e3780aea1"]
}

# Trust policy: only allow the deploy job on the master branch of this repo.
# Using StringLike (with wildcard) rather than StringEquals lets us cover
# both branch pushes (ref:refs/heads/master) and tag-based deploys in future.
data "aws_iam_policy_document" "github_actions_trust" {
  statement {
    sid     = "GitHubOIDCTrust"
    effect  = "Allow"
    actions = ["sts:AssumeRoleWithWebIdentity"]

    principals {
      type        = "Federated"
      identifiers = [aws_iam_openid_connect_provider.github.arn]
    }

    # aud: the audience GitHub puts in every token (always sts.amazonaws.com)
    condition {
      test     = "StringEquals"
      variable = "token.actions.githubusercontent.com:aud"
      values   = ["sts.amazonaws.com"]
    }

    # sub: scoped to master branch of this repo only.
    # A fork, a PR from a fork, or any other branch cannot assume this role.
    condition {
      test     = "StringLike"
      variable = "token.actions.githubusercontent.com:sub"
      values   = ["repo:${var.github_repo}:ref:refs/heads/master"]
    }
  }
}

resource "aws_iam_role" "github_actions_deploy" {
  name               = "portfolio-github-actions-deploy"
  description        = "Assumed by GitHub Actions via OIDC for portfolio deployments"
  assume_role_policy = data.aws_iam_policy_document.github_actions_trust.json

  # Short session duration — deploy takes < 5 min; no reason for longer tokens
  max_session_duration = 3600 # 1 hour (AWS minimum)

  tags = {
    Project   = "portfolio"
    ManagedBy = "terraform"
  }
}

data "aws_iam_policy_document" "github_actions_deploy" {
  statement {
    sid    = "S3SyncAccess"
    effect = "Allow"

    actions = [
      "s3:PutObject",
      "s3:DeleteObject",
      "s3:ListBucket",
    ]

    resources = [
      aws_s3_bucket.site.arn,
      "${aws_s3_bucket.site.arn}/*",
    ]
  }

  statement {
    sid    = "CloudFrontInvalidation"
    effect = "Allow"

    actions = [
      "cloudfront:CreateInvalidation",
      "cloudfront:GetInvalidation",  # required for `aws cloudfront wait invalidation-completed`
    ]

    resources = [aws_cloudfront_distribution.site.arn]
  }
}

resource "aws_iam_role_policy" "github_actions_deploy" {
  name   = "portfolio-deploy-policy"
  role   = aws_iam_role.github_actions_deploy.id
  policy = data.aws_iam_policy_document.github_actions_deploy.json
}

###############################################################################
# Outputs
###############################################################################

output "cloudfront_domain" {
  description = "CloudFront distribution domain — point your DNS CNAME here"
  value       = aws_cloudfront_distribution.site.domain_name
}

output "cloudfront_distribution_id" {
  description = "Distribution ID needed for cache invalidations in CI"
  value       = aws_cloudfront_distribution.site.id
}

output "s3_bucket_name" {
  description = "S3 bucket name"
  value       = aws_s3_bucket.site.id
}

output "github_actions_role_arn" {
  description = "IAM role ARN to set as DEPLOY_ROLE_ARN in GitHub Actions secrets"
  value       = aws_iam_role.github_actions_deploy.arn
}
