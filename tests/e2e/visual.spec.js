import { test, expect } from '@playwright/test';

/**
 * Visual regression tests — pixel-level screenshot comparisons.
 *
 * First run: Playwright creates baseline images in tests/e2e/__screenshots__/
 * Subsequent runs: fails if pixels differ beyond threshold.
 * To update baselines intentionally: npx playwright test --update-snapshots
 *
 * Serial mode: visual tests must not run in parallel with each other — font
 * loading under concurrent load causes pixel-level flakiness.
 */

test.describe.configure({ mode: 'serial' });

/**
 * Google Fonts fetch reliability on shared CI runners is itself
 * non-deterministic: the @font-face CSS can register successfully while the
 * actual woff2 binary silently fails to download, so one run renders with
 * Outfit and another with the system-font fallback (different metrics ->
 * different line wraps -> real page-height differences between two
 * otherwise-identical runs — first seen as a ~95px full-page diff, then as a
 * 112px hero diff, between a freshly-regenerated baseline and the very next
 * verification run of the same commit). No amount of client-side waiting
 * fixes an external network flake, so every visual test blocks the Google
 * Fonts requests instead — every run, baseline or verification, consistently
 * renders with the fallback font ('Segoe UI'/system-ui from the font-family
 * stack in main.css), trading "pretty in the report" for actually
 * deterministic.
 */
test.beforeEach(async ({ page }) => {
  await page.route(/fonts\.(googleapis|gstatic)\.com/, (route) => route.abort());
});

test.describe('Visual regression', () => {
  test('hero section', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(400);
    await expect(page.locator('.hero__content')).toHaveScreenshot('hero-content.png', {
      maxDiffPixelRatio: 0.02,
    });
  });

  test('skills grid', async ({ page }) => {
    await page.goto('/');
    await page.locator('#skills').scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    await expect(page.locator('.skills__grid')).toHaveScreenshot('skills-grid.png', {
      maxDiffPixelRatio: 0.02,
    });
  });

  test('experience card expanded', async ({ page }) => {
    await page.goto('/');
    const card = page.getByRole('article', { name: 'Software Technical Lead at Qantas Airways' });
    await card.getByRole('button').click();
    await page.waitForTimeout(500); // accordion animation
    await expect(card).toHaveScreenshot('qantas-expanded.png', { maxDiffPixelRatio: 0.02 });
  });

  test('full page — desktop', async ({ page }) => {
    await page.goto('/');
    // Scroll-reveal fades sections in via IntersectionObserver as they enter
    // the viewport; a fullPage screenshot stitches the page together while
    // scrolling, which can outrun the observer and capture a section mid-fade.
    // Force every reveal target to settle before the pixel comparison.
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(700);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(400);
    await expect(page).toHaveScreenshot('full-page-desktop.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.02,
    });
  });
});

test.describe('Visual regression — Quality Suite', () => {
  test('quality suite hero', async ({ page }) => {
    await page.goto('/testing.html');
    await page.waitForTimeout(400);
    await expect(page.locator('.tq-hero__stats')).toHaveScreenshot('quality-suite-hero-stats.png', {
      maxDiffPixelRatio: 0.02,
    });
  });

  test('pipeline with PR Checks panel open', async ({ page }) => {
    await page.goto('/testing.html');
    await page.getByRole('button', { name: 'PR Checks' }).click();
    await page.waitForTimeout(300);
    await expect(page.locator('.tq-pipeline-section')).toHaveScreenshot('quality-suite-pipeline-panel.png', {
      maxDiffPixelRatio: 0.02,
    });
  });

});

// Deliberately not a full second copy of the light-theme suite above — light
// is the default and gets full coverage; dark is a themed override of the
// same tokens, so these two catch "dark theme renders broken/unstyled"
// without doubling the Linux-baseline maintenance burden of every component.
test.describe('Visual regression — Dark theme', () => {
  test.beforeEach(async ({ page }) => {
    // Set the preference the theme-init script reads, then reload so it
    // applies data-theme="dark" before first paint — the same path a
    // returning dark-mode visitor takes, rather than screenshotting mid-toggle.
    await page.goto('/');
    await page.evaluate(() => localStorage.setItem('theme', 'dark'));
    await page.reload();
    await page.waitForTimeout(400);
  });

  test('hero section', async ({ page }) => {
    await expect(page.locator('.hero__content')).toHaveScreenshot('hero-content-dark.png', {
      maxDiffPixelRatio: 0.02,
    });
  });

  test('full page — desktop', async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(700);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(400);
    await expect(page).toHaveScreenshot('full-page-desktop-dark.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.02,
    });
  });
});
