const { test, expect } = require('@playwright/test');

/**
 * Regression guard for the exact failure mode that silently dropped
 * favicon.svg from the S3 deploy sync (fixed in PR #48): the GitHub Actions
 * sync step uses an --include allowlist, so a new root-level file can exist
 * in the repo, pass all other tests, and still 404 in production because it
 * was never added to the allowlist. This runs both locally (PR checks,
 * against `npx serve .`) and against the live site (e2e-live job).
 */
test.describe('robots.txt and sitemap.xml are deployed', () => {
  test('robots.txt is served and points to the sitemap', async ({ request }) => {
    const res = await request.get('/robots.txt');
    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body).toMatch(/Allow: \//);
    expect(body).toMatch(/Sitemap: https:\/\/portfolio\.sidsalunke\.info\/sitemap\.xml/);
  });

  test('sitemap.xml is served and lists all indexable pages', async ({ request }) => {
    const res = await request.get('/sitemap.xml');
    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body).toMatch(/<urlset/);
    expect(body).toContain('https://portfolio.sidsalunke.info');
    expect(body).toContain('/ai-engineering.html');
    expect(body).toContain('/testing.html');
  });
});
