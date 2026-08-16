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
  { name: 'index.html',           path: '/' },
  { name: 'testing.html',         path: '/testing.html' },
  { name: 'ai-engineering.html',  path: '/ai-engineering.html' },
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
