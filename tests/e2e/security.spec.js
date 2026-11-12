import { test, expect } from '@playwright/test';

/**
 * Security headers test suite.
 *
 * Asserts that every page load ships the expected defensive HTTP-layer and
 * HTML-layer security controls.  Running this in CI means a misconfigured
 * deploy (e.g. a CDN rule that strips headers, or a bad merge that removes
 * the CSP meta tag) fails the pipeline immediately rather than silently
 * weakening the security posture.
 *
 * Why meta tags instead of (or in addition to) HTTP headers?
 * S3 static hosting doesn't support custom response headers natively.
 * Embedding the policy in the HTML guarantees enforcement even before a
 * CloudFront distribution (which can set proper headers) is in front of S3.
 * The Playwright checks below verify both layers where applicable.
 *
 * Covers all three pages — each has its own copy of these meta tags, so a
 * future edit to one page's <head> that drifts from the others (or drops a
 * tag entirely) fails here instead of only being caught on index.html.
 */

const PAGES = [
  { name: 'index',           path: '/' },
  { name: 'testing',         path: '/testing' },
  { name: 'ai-engineering',  path: '/ai-engineering' },
];

for (const { name, path } of PAGES) {
  test.describe(`Security headers & policy — ${name}`, () => {
    test('Content-Security-Policy meta tag is present and restrictive', async ({ page }) => {
      await page.goto(path);

      const csp = await page.locator('meta[http-equiv="Content-Security-Policy"]').getAttribute('content');
      expect(csp).toBeTruthy();

      // default-src must be 'none' — deny-by-default is the foundation of CSP
      expect(csp).toContain("default-src 'none'");

      // No wildcard script sources — prevents XSS via injected scripts
      expect(csp).not.toContain('script-src *');
      expect(csp).not.toContain("'unsafe-eval'");

      // frame-ancestors is a header-only directive; browsers ignore it in <meta>.
      // Clickjacking protection is enforced at the CloudFront edge via X-Frame-Options: DENY
      // (see infra/main.tf frame_options block). We explicitly assert it is NOT in the
      // meta CSP so a future contributor doesn't add it back thinking it works here.
      expect(csp).not.toContain('frame-ancestors');

      // base-uri locked down — prevents <base> tag injection
      expect(csp).toContain("base-uri 'self'");

      // form-action locked down — no forms, so this should be 'none'
      expect(csp).toContain("form-action 'none'");
    });

    test('X-Content-Type-Options meta tag prevents MIME sniffing', async ({ page }) => {
      await page.goto(path);
      const val = await page
        .locator('meta[http-equiv="X-Content-Type-Options"]')
        .getAttribute('content');
      expect(val).toBe('nosniff');
    });

    test('Referrer-Policy meta tag limits referrer leakage', async ({ page }) => {
      await page.goto(path);
      const val = await page
        .locator('meta[http-equiv="Referrer-Policy"]')
        .getAttribute('content');
      expect(val).toBe('strict-origin-when-cross-origin');
    });

    test('Permissions-Policy disables sensitive browser APIs', async ({ page }) => {
      await page.goto(path);
      const val = await page
        .locator('meta[http-equiv="Permissions-Policy"]')
        .getAttribute('content');
      expect(val).toBeTruthy();
      // Camera, microphone, geolocation and payment must all be explicitly denied
      expect(val).toContain('camera=()');
      expect(val).toContain('microphone=()');
      expect(val).toContain('geolocation=()');
      expect(val).toContain('payment=()');
    });

    test('page loads successfully with the CSP in place (no blocked resources)', async ({ page }) => {
      const cspViolations = [];
      // Listen for any content that the browser's CSP engine blocks
      page.on('console', msg => {
        if (msg.type() === 'error' && msg.text().includes('Content Security Policy')) {
          cspViolations.push(msg.text());
        }
      });

      await page.goto(path);
      // Wait for fonts and deferred resources to settle
      await page.waitForTimeout(1000);

      expect(cspViolations).toHaveLength(0);
    });
  });
}

/**
 * Real response headers, set by CloudFront (infra/main.tf). The tests above
 * check <meta> tags, which is all a local static server can offer, but
 * browsers ignore several policies unless they arrive as HTTP headers
 * (Permissions-Policy, frame-ancestors, HSTS). These run against the live
 * site only: BASE_URL is set by the e2e-live job after each deploy.
 */
const LIVE_PATHS = ['/', '/testing', '/ai-engineering', '/writing', '/writing/rollback-static-site-s3-cloudfront'];

for (const path of LIVE_PATHS) {
  test.describe(`Response headers from the CDN — ${path}`, () => {
    test.skip(!process.env.BASE_URL, 'response headers are set by CloudFront; live site only');

    test('security headers are sent', async ({ request }) => {
      const headers = (await request.get(path)).headers();

      expect(headers['content-security-policy']).toContain("default-src 'none'");
      expect(headers['content-security-policy']).toContain("frame-ancestors 'none'");
      expect(headers['strict-transport-security']).toMatch(/max-age=31536000/);
      expect(headers['x-content-type-options']).toBe('nosniff');
      expect(headers['x-frame-options']).toBe('DENY');
      expect(headers['referrer-policy']).toBe('strict-origin-when-cross-origin');

      const permissions = headers['permissions-policy'];
      expect(permissions).toBeTruthy();
      for (const feature of ['camera', 'microphone', 'geolocation', 'payment']) {
        expect(permissions).toContain(`${feature}=()`);
      }
    });
  });
}
