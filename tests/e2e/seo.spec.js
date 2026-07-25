/**
 * SEO end-to-end tests — Playwright (real Chromium).
 *
 * These complement the faster Jest/jsdom SEO unit tests with checks that
 * require a real browser: rendered document.title, meta tag values as seen
 * by the browser engine, JSON-LD parsing, and canonical URL correctness.
 *
 * Runs on every PR against the local dev server (playwright.config.js starts
 * `npx serve -p 3000` automatically when BASE_URL is not set).
 *
 * Also runs post-deploy against the live site via the e2e-live job in
 * deploy.yml — the canonical URL assertion verifies the live domain is
 * correctly self-referential.
 *
 * What is NOT tested here:
 *   - HTTP security response headers (X-Frame-Options, HSTS, etc.)
 *     → tests/e2e/security.spec.js
 *   - Lighthouse scores
 *     → post-deploy update-badges job in deploy.yml
 */

const { test, expect } = require('@playwright/test');

const LIVE_ORIGIN  = 'https://portfolio.sidsalunke.info';
const CANONICAL    = LIVE_ORIGIN;

test.describe('SEO — rendered meta tags', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('page title contains name and role', async ({ page }) => {
    const title = await page.title();
    expect(title).toMatch(/Siddharth Salunke/i);
    expect(title).toMatch(/Quality Engineer/i);
  });

  test('meta description is present and meaningful', async ({ page }) => {
    const content = await page.locator('meta[name="description"]').getAttribute('content');
    expect(content).toBeTruthy();
    expect(content.length).toBeGreaterThanOrEqual(50);
    expect(content.length).toBeLessThanOrEqual(160);
  });

  test('canonical URL is set to the live domain', async ({ page }) => {
    const href = await page.locator('link[rel="canonical"]').getAttribute('href');
    expect(href).toBe(CANONICAL);
  });

  test('robots meta allows indexing', async ({ page }) => {
    const content = await page.locator('meta[name="robots"]').getAttribute('content');
    expect(content).toMatch(/index/);
    expect(content).toMatch(/follow/);
  });

  test('html lang attribute is "en"', async ({ page }) => {
    const lang = await page.evaluate(() => document.documentElement.getAttribute('lang'));
    expect(lang).toBe('en');
  });
});

test.describe('SEO — Open Graph tags', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('og:type is website', async ({ page }) => {
    const content = await page.locator('meta[property="og:type"]').getAttribute('content');
    expect(content).toBe('website');
  });

  test('og:url matches canonical', async ({ page }) => {
    const content = await page.locator('meta[property="og:url"]').getAttribute('content');
    expect(content).toBe(CANONICAL);
  });

  test('og:title is present', async ({ page }) => {
    const content = await page.locator('meta[property="og:title"]').getAttribute('content');
    expect(content.length).toBeGreaterThan(5);
  });

  test('og:description is present', async ({ page }) => {
    const content = await page.locator('meta[property="og:description"]').getAttribute('content');
    expect(content.length).toBeGreaterThanOrEqual(40);
  });

  test('og:image is an absolute URL', async ({ page }) => {
    const content = await page.locator('meta[property="og:image"]').getAttribute('content');
    expect(content).toMatch(/^https?:\/\//);
  });
});

test.describe('SEO — Twitter Card', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('twitter:card is present', async ({ page }) => {
    const content = await page.locator('meta[name="twitter:card"]').getAttribute('content');
    expect(['summary', 'summary_large_image']).toContain(content);
  });

  test('twitter:title is present', async ({ page }) => {
    const content = await page.locator('meta[name="twitter:title"]').getAttribute('content');
    expect(content.length).toBeGreaterThan(5);
  });

  test('twitter:description is present', async ({ page }) => {
    const content = await page.locator('meta[name="twitter:description"]').getAttribute('content');
    expect(content.length).toBeGreaterThanOrEqual(40);
  });
});

test.describe('SEO — JSON-LD structured data', () => {
  let schema;

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    schema = await page.evaluate(() => {
      const el = document.querySelector('script[type="application/ld+json"]');
      return el ? JSON.parse(el.textContent) : null;
    });
  });

  test('JSON-LD script is present and valid JSON', async () => {
    expect(schema).not.toBeNull();
    expect(typeof schema).toBe('object');
  });

  test('@type is Person', async () => {
    expect(schema['@type']).toBe('Person');
  });

  test('name matches page owner', async () => {
    expect(schema.name).toBe('Siddharth Salunke');
  });

  test('url matches canonical', async () => {
    expect(schema.url).toBe(CANONICAL);
  });

  test('sameAs contains LinkedIn', async () => {
    expect(schema.sameAs.some(s => s.includes('linkedin.com/in/sidsalunke'))).toBe(true);
  });

  test('sameAs contains GitHub', async () => {
    expect(schema.sameAs.some(s => s.includes('github.com/sidsalunke'))).toBe(true);
  });

  test('worksFor is an Organization', async () => {
    expect(schema.worksFor?.['@type']).toBe('Organization');
  });
});

test.describe('SEO — document structure', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('exactly one <h1> on the page', async ({ page }) => {
    const count = await page.locator('h1').count();
    expect(count).toBe(1);
  });

  test('<h1> contains the person name', async ({ page }) => {
    const text = await page.locator('h1').innerText();
    expect(text).toMatch(/Siddharth Salunke/i);
  });

  test('all <img> elements have non-empty alt text', async ({ page }) => {
    const imgs = await page.locator('img').all();
    for (const img of imgs) {
      const alt = await img.getAttribute('alt');
      expect(alt).toBeTruthy();
    }
  });

  test('page has at least two <h2> section headings', async ({ page }) => {
    const count = await page.locator('h2').count();
    expect(count).toBeGreaterThanOrEqual(2);
  });

  test('no <title> tag appears more than once', async ({ page }) => {
    const count = await page.evaluate(() =>
      document.querySelectorAll('title').length
    );
    expect(count).toBe(1);
  });
});
