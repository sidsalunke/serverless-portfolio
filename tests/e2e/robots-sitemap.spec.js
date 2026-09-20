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
    expect(body).toContain('/ai-engineering');
    expect(body).toContain('/testing');
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

// The clean-URL rewrite/redirect happens at the CloudFront edge (see
// infra/functions/clean-urls.js) — the S3 objects are still named
// testing.html and ai-engineering.html. Locally, `npx serve` mimics this via
// serve.json's cleanUrls option, so the same behavior is testable in both
// PR checks and the live e2e job without needing two separate code paths.
test.describe('clean URLs', () => {
  test('/testing serves the Quality Suite page', async ({ request }) => {
    const res = await request.get('/testing');
    expect(res.status()).toBe(200);
    expect(await res.text()).toContain('Quality Suite');
  });

  test('/ai-engineering serves the AI Engineering page', async ({ request }) => {
    const res = await request.get('/ai-engineering');
    expect(res.status()).toBe(200);
    expect(await res.text()).toContain('AI Engineering');
  });

  test('/testing.html redirects permanently to /testing', async ({ request }) => {
    const res = await request.get('/testing.html', { maxRedirects: 0 });
    expect(res.status()).toBe(301);
    expect(res.headers()['location']).toBe('/testing');
  });

  test('/ai-engineering.html redirects permanently to /ai-engineering', async ({ request }) => {
    const res = await request.get('/ai-engineering.html', { maxRedirects: 0 });
    expect(res.status()).toBe(301);
    expect(res.headers()['location']).toBe('/ai-engineering');
  });

  // The exact redirect chain for /index.html differs between environments
  // (CloudFront does it in one hop; the local `serve` shim used for PR
  // checks does /index.html -> /index -> / in two), so this follows
  // redirects to completion and checks the destination, not the hop count.
  test('/index.html eventually redirects to the homepage', async ({ request }) => {
    const res = await request.get('/index.html');
    expect(res.status()).toBe(200);
    expect(new URL(res.url()).pathname).toBe('/');
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
