const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;

/**
 * Browser tests for the /writing section.
 *
 * The jsdom tests (tests/unit/writing.test.js) check markup only. Layout,
 * computed font sizes and real colour contrast need a browser. Two layout
 * bugs shipped here before these tests existed: the header was indented
 * twice as far as the body on phones, and body copy rendered below 16px.
 * Both are asserted directly below, at phone and desktop widths.
 */

const ARTICLE = '/writing/rollback-static-site-s3-cloudfront';

const PAGES = [
  { name: 'index',   path: '/writing', heading: 'Writing',                                              body: '.post-list' },
  { name: 'article', path: ARTICLE,    heading: 'Automatic rollback for a static S3 + CloudFront site', body: '.post__body h2' },
];

const VIEWPORTS = [
  { name: 'phone',   width: 375,  height: 812 },
  { name: 'desktop', width: 1280, height: 800 },
];

for (const { name, path, heading, body } of PAGES) {
  test.describe(`Writing ${name}`, () => {
    test('loads with its heading and a self canonical', async ({ page }) => {
      const response = await page.goto(path);
      expect(response.status()).toBe(200);
      await expect(page.getByRole('heading', { level: 1, name: heading })).toBeVisible();
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `https://portfolio.sidsalunke.info${path}`);
    });

    test('marks Writing as the current page in the nav', async ({ page }) => {
      await page.goto(path);
      await expect(page.locator('#nav-links a[href="/writing"]')).toHaveAttribute('aria-current', 'page');
    });

    for (const viewport of VIEWPORTS) {
      test.describe(`at ${viewport.name} width`, () => {
        test.use({ viewport: { width: viewport.width, height: viewport.height } });

        test('has no horizontal overflow', async ({ page }) => {
          await page.goto(path);
          const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
          expect(overflow).toBeLessThanOrEqual(0);
        });

        test('header and body share a left edge', async ({ page }) => {
          await page.goto(path);
          const [headerLeft, bodyLeft] = await page.evaluate((selector) => [
            document.querySelector('h1').getBoundingClientRect().left,
            document.querySelector(selector).getBoundingClientRect().left,
          ], body);
          expect(Math.abs(headerLeft - bodyLeft)).toBeLessThanOrEqual(1);
        });

        test('reading text is at least 16px and no text is below 12px', async ({ page }) => {
          await page.goto(path);
          const sizes = await page.evaluate(() => {
            const px = (el) => parseFloat(getComputedStyle(el).fontSize);
            const reading = [...document.querySelectorAll('.tq-hero__sub, .post__body > p, .post__body li, .post-list__summary')];
            const all = [...document.querySelectorAll('main *, article *')]
              .filter((el) => [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()))
              .filter((el) => el.getClientRects().length > 0);
            return { reading: Math.min(...reading.map(px)), smallest: Math.min(...all.map(px)), count: reading.length };
          });
          expect(sizes.count).toBeGreaterThan(0);
          expect(sizes.reading).toBeGreaterThanOrEqual(16);
          expect(sizes.smallest).toBeGreaterThanOrEqual(12);
        });

        test('has no WCAG 2.1 AA violations', async ({ page }) => {
          await page.goto(path);
          // Let the scroll-reveal fade settle: a mid-transition sample can
          // read as a contrast failure that is not there once it finishes.
          await page.waitForTimeout(700);
          const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
          expect(results.violations).toEqual([]);
        });
      });
    }
  });
}

test.describe('Writing index', () => {
  test('links to the article, and the link works', async ({ page }) => {
    await page.goto('/writing');
    await page.locator(`.post-list a[href="${ARTICLE}"]`).click();
    await expect(page).toHaveURL(new RegExp(`${ARTICLE}$`));
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Automatic rollback for a static S3 + CloudFront site');
  });
});

test.describe('Writing article', () => {
  test('code blocks scroll inside their own box on a phone', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(ARTICLE);
    const blocks = await page.evaluate(() => [...document.querySelectorAll('.post__body pre')].map((pre) => ({
      right: pre.getBoundingClientRect().right,
      overflowX: getComputedStyle(pre).overflowX,
    })));
    expect(blocks.length).toBeGreaterThan(0);
    blocks.forEach((block) => {
      expect(block.right).toBeLessThanOrEqual(375);
      expect(block.overflowX).toBe('auto');
    });
  });

  test('links back to the index', async ({ page }) => {
    await page.goto(ARTICLE);
    await page.locator('.post__back').click();
    await expect(page).toHaveURL(/\/writing$/);
  });
});

// CloudFront (and `serve` locally) answer an unknown path with 404.html. Its
// assets used to be relative URLs, so under /writing/ the page had no styles.
test.describe('404 page under a nested path', () => {
  test('returns 404 and is styled', async ({ page }) => {
    const response = await page.goto('/writing/this-page-does-not-exist');
    expect(response.status()).toBe(404);
    await expect(page.locator('#main-nav')).toBeVisible();
    const stylesApplied = await page.evaluate(() => getComputedStyle(document.getElementById('main-nav')).position);
    expect(stylesApplied).toBe('fixed');
  });
});
