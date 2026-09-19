const { test, expect } = require('@playwright/test');

/**
 * Regression guard for the exact failure mode that silently dropped
 * favicon.svg from the S3 deploy sync (fixed in PR #48): the GitHub Actions
 * sync step uses an --include allowlist, so a new root-level file can exist
 * in the repo, pass all other tests, and still 404 in production because it
 * was never added to the allowlist. This runs both locally (PR checks,
 * against `npx serve .`) and against the live site (e2e-live job).
 */
test.describe('robots.txt, sitemap_index.xml, and the IndexNow key file are deployed', () => {
  test('robots.txt is served and points to the sitemap', async ({ request }) => {
    const res = await request.get('/robots.txt');
    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body).toMatch(/Allow: \//);
    expect(body).toMatch(/Sitemap: https:\/\/portfolio\.sidsalunke\.info\/sitemap_index\.xml/);
  });

  test('sitemap_index.xml is served and lists all indexable pages', async ({ request }) => {
    const res = await request.get('/sitemap_index.xml');
    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body).toMatch(/<urlset/);
    expect(body).toContain('https://portfolio.sidsalunke.info');
    expect(body).toContain('/ai-engineering.html');
    expect(body).toContain('/testing.html');
  });

  test('IndexNow key file is served and matches the key used in deploy.yml', async ({ request }) => {
    const res = await request.get('/d6a69049b7ef3ef62df1b7ead257a870.txt');
    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body.trim()).toBe('d6a69049b7ef3ef62df1b7ead257a870');
  });

  test('llms.txt is served and follows the llmstxt.org format', async ({ request }) => {
    const res = await request.get('/llms.txt');
    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body).toMatch(/^# /); // must open with an H1
  });
});

test.describe('unknown paths return a real 404, not a soft-200', () => {
  test('a nonexistent path returns HTTP 404 with the 404 page', async ({ request }) => {
    const res = await request.get('/this-page-does-not-exist-xyz123');
    expect(res.status()).toBe(404);
    const body = await res.text();
    expect(body).toContain('Page not found');
  });
});
