# Siddharth Salunke — Portfolio

Personal portfolio site for [portfolio.sidsalunke.info](https://portfolio.sidsalunke.info).

## A note on the repo name

The repo is named `serverless-portfolio` — a name that no longer reflects what's here. It originally referred to an AWS-native pipeline that used a Lambda function to deploy files to S3. That infrastructure has since been replaced entirely: there is no Lambda, no CodePipeline, no CodeBuild. The site is a plain static site (HTML, CSS, vanilla JS) deployed via GitHub Actions. The repo name is kept as-is to preserve the git history and any existing links.

## What this repo demonstrates

Beyond being a personal portfolio, this repo is intended as a reference for production-quality frontend engineering practices — specifically the kind of multi-layered quality and security pipeline you'd want on any real project:

- Zero-dependency frontend (no framework, no bundler — just HTML, CSS, and vanilla JS)
- Comprehensive test suite across three distinct layers (unit, static analysis, E2E)
- Security controls built into both the application and the CI/CD pipeline
- Infrastructure as Code for the hosting platform
- Keyless CI/CD authentication via OIDC

---

## Tech stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML5, CSS3, vanilla JavaScript (ES5-compatible, no build step) |
| Fonts | Google Fonts (Inter) — loaded non-blocking, CSP-compliant |
| Icons | Inline SVG sprite (zero network requests) |
| Hosting | AWS S3 (private) + CloudFront CDN |
| DNS / TLS | AWS Route 53 + ACM (TLS 1.2 minimum) |
| CI/CD | GitHub Actions |
| Infrastructure | Terraform |
| Testing | Jest + jest-axe + Playwright |

---

## Project structure

```
.
├── index.html                  # Entire site — content, SVG sprite, security headers
├── js/
│   └── app.js                  # All runtime behaviour (nav, accordion, font activation)
├── styles/
│   └── main.css                # Design tokens, layout, components
├── images/                     # Static assets
├── infra/
│   └── main.tf                 # Terraform — S3, CloudFront, IAM, OIDC provider
├── tests/
│   ├── unit/                   # Jest unit tests (app.js logic)
│   ├── a11y/                   # jest-axe static accessibility tests
│   ├── snapshot/               # Jest DOM snapshot tests
│   └── e2e/                    # Playwright end-to-end tests
│       ├── navigation.spec.js
│       ├── experience.spec.js
│       ├── mobile.spec.js
│       ├── accessibility.spec.js
│       ├── security.spec.js
│       └── visual.spec.js
├── .github/workflows/
│   ├── pr.yml                  # Checks that run on every pull request
│   └── deploy.yml              # Deploy + post-deploy verification on merge to master
├── jest.config.js
└── playwright.config.js
```

---

## Test suite

89 tests across two runners.

### Jest (25 tests — fast, no browser)

| Suite | File | What it covers |
|-------|------|---------------|
| Unit | `tests/unit/app.test.js` | Footer year, hamburger open/close, backdrop, accordion expand/collapse, keyboard (Enter/Space) |
| Accessibility | `tests/a11y/accessibility.test.js` | WCAG 2.1 AA via jest-axe, alt text, keyboard reachability, single `<h1>`, landmark regions |
| Snapshot | `tests/snapshot/structure.test.js` | DOM structure of nav, hero, experience list, skills grid, footer — catches unintended HTML changes |

Run: `npm test`

### Playwright (64 tests — real Chromium + mobile Chrome)

| Suite | File | What it covers |
|-------|------|---------------|
| Navigation | `tests/e2e/navigation.spec.js` | Hero content, nav links, scroll behaviour, logo, section headings, external links |
| Experience | `tests/e2e/experience.spec.js` | All 6 companies, accordion expand/collapse, single-open enforcement, keyboard access, Visit links |
| Mobile | `tests/e2e/mobile.spec.js` | Hamburger visibility, drawer open/close, backdrop, no horizontal scroll |
| Accessibility | `tests/e2e/accessibility.spec.js` | axe-core WCAG 2.1 AA in real Chromium — on load, with accordion expanded, with mobile drawer open |
| Security | `tests/e2e/security.spec.js` | CSP meta tag present and restrictive, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, zero CSP violations at runtime |
| Visual | `tests/e2e/visual.spec.js` | Pixel-level screenshot comparisons for hero, skills grid, expanded card, full-page desktop |

Run: `npm run test:e2e`

---

## CI/CD pipeline

### On every pull request (`pr.yml`)

Three jobs run in parallel:

```
static-tests ──┐
               ├──► playwright (gates on both)
security-scan ─┘
```

**`static-tests`** — unit, accessibility, and snapshot tests via Jest.

**`security-scan`** — three complementary tools covering different threat surfaces:
- `npm audit --audit-level=high` — known CVEs in dependencies (supply chain)
- Semgrep (`p/javascript`, `p/html`, `p/secrets`) — SAST for insecure code patterns
- Gitleaks — secret scanning across all commits on the branch

**`playwright`** — full 64-test Playwright suite against a local `npx serve` server (started automatically by `playwright.config.js`).

### On merge to master (`deploy.yml`)

```
deploy ──► e2e-live
sbom (parallel with deploy)
```

**`deploy`** — syncs static files to S3, then invalidates the CloudFront cache. Files are live the moment the invalidation completes.

**`sbom`** — generates a CycloneDX JSON Software Bill of Materials via `@cyclonedx/cyclonedx-npm`, uploaded as a workflow artifact (retained 90 days).

**`e2e-live`** — runs the Playwright suite against `https://portfolio.sidsalunke.info` to verify the live deployment.

### Authentication

GitHub Actions authenticates to AWS via **OIDC** — no long-lived access keys stored anywhere. Each workflow run receives a short-lived JWT from GitHub, which AWS exchanges for temporary credentials scoped to the deploy role. The role trust policy restricts this to master branch pushes from this repo only. The role itself has the minimum permissions needed: `s3:PutObject`, `s3:DeleteObject`, `s3:ListBucket`, `cloudfront:CreateInvalidation`.

---

## Infrastructure (Terraform)

`infra/main.tf` codifies the full hosting stack:

- **S3 bucket** — private, versioned, AES-256 encrypted. Public access fully blocked; direct S3 URLs return 403.
- **CloudFront OAC** — Origin Access Control signs all S3 requests with SigV4. Only CloudFront can read the bucket.
- **CloudFront distribution** — TLS 1.2 minimum, HTTP→HTTPS redirect, HSTS (1 year, includeSubDomains, preload).
- **Security headers policy** — enforced at the CDN edge on every response: `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, strict CSP.
- **GitHub OIDC provider** — registered once per AWS account; enables keyless authentication from GitHub Actions.
- **IAM deploy role** — least-privilege, trusted only by this repo's master branch via OIDC.

---

## Getting started

### Prerequisites

- Node.js 20+
- npm
- [Playwright browsers](https://playwright.dev/docs/browsers): `npx playwright install chromium`

### Run locally

```bash
npm install
npm start          # serves at http://localhost:3000
```

### Run tests

```bash
# Jest (unit + a11y + snapshot)
npm test

# Individual suites
npm run test:unit
npm run test:a11y
npm run test:snapshot

# Playwright (spins up local server automatically)
npm run test:e2e

# Playwright against the live site
npm run test:e2e:live
```

### Update visual regression baselines

Run this after intentional UI changes to regenerate the reference screenshots:

```bash
npx playwright test --update-snapshots
```

Commit the updated files in `tests/e2e/visual.spec.js-snapshots/`.

### Infrastructure

Requires [Terraform](https://developer.hashicorp.com/terraform/downloads) 1.5+ and AWS credentials with sufficient permissions.

```bash
cd infra
terraform init    # first time only — requires the S3 state bucket to exist
terraform plan
terraform apply
```

The S3 remote state backend (`portfolio-tfstate-sidsalunke`) and DynamoDB lock table (`portfolio-tfstate-lock`) must be created manually before the first `terraform init`.

### Required GitHub Actions secrets

| Secret | Description |
|--------|-------------|
| `DEPLOY_ROLE_ARN` | ARN of the IAM OIDC role (`arn:aws:iam::<account>:role/portfolio-github-actions-deploy`) |
| `CLOUDFRONT_DISTRIBUTION_ID` | CloudFront distribution ID for cache invalidation |
| `SEMGREP_APP_TOKEN` | Optional — enables Semgrep Cloud dashboard. OSS engine runs without it. |
| `GITLEAKS_LICENSE` | Optional — only required for private org repos on the paid Gitleaks plan. |

---

## Brief history

The repo started as a React + Webpack application with an AWS-native CI/CD pipeline (CodePipeline → CodeBuild → Lambda → S3). The Lambda function handled uploading built assets to the S3 bucket.

This setup introduced two problems: the webpack dev bundle included all ~1,000 Font Awesome icons even though only 11 were used, producing a 3 MB bundle and a 37-second Largest Contentful Paint. And the CodePipeline/CodeBuild/Lambda stack added infrastructure complexity with no real benefit for a site with zero server-side logic.

The current version strips all of that out: no React, no Webpack, no Lambda, no CodePipeline. The site is plain HTML, CSS, and ~3 KB of vanilla JS. The AWS-native pipeline is replaced by GitHub Actions. Total JS payload went from 1.37 MB to 2.9 KB.
