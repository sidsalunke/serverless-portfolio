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
 * document.fonts.ready alone doesn't guarantee the Outfit webfont actually
 * won its font-display: optional swap window — under CI network variance,
 * one run can render with Outfit and another with the system-font fallback
 * (different metrics -> different line wraps -> real, deterministic-per-run
 * but non-deterministic-across-runs layout height, seen as a ~95px full-page
 * diff between two otherwise-identical runs). Explicitly loading each weight
 * removes the race instead of just hoping the swap resolved in time.
 */
async function waitForFonts(page) {
  // The Outfit @font-face isn't registered in the CSSOM until app.js flips
  // #google-fonts from rel="preload" to rel="stylesheet" — document.fonts.load()
  // silently no-ops on a family with no matching @font-face yet, so calling
  // it before this flip defeats the whole point of this helper.
  await page.waitForFunction(
    () => document.getElementById('google-fonts')?.rel === 'stylesheet'
  );
  await page.evaluate(async () => {
    await Promise.all(
      [400, 500, 600, 700, 800].map((w) => document.fonts.load(`${w} 16px Outfit`))
    );
    await document.fonts.ready;
  });
}

test.describe('Visual regression', () => {
  test('hero section', async ({ page }) => {
    await page.goto('/');
    await waitForFonts(page);
    await page.waitForTimeout(400);
    await expect(page.locator('.hero__content')).toHaveScreenshot('hero-content.png', {
      maxDiffPixelRatio: 0.02,
    });
  });

  test('skills grid', async ({ page }) => {
    await page.goto('/');
    await waitForFonts(page);
    await page.locator('#skills').scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    await expect(page.locator('.skills__grid')).toHaveScreenshot('skills-grid.png', {
      maxDiffPixelRatio: 0.02,
    });
  });

  test('experience card expanded', async ({ page }) => {
    await page.goto('/');
    await waitForFonts(page);
    const card = page.getByRole('article', { name: 'Software Technical Lead at Qantas Airways' });
    await card.getByRole('button').click();
    await page.waitForTimeout(500); // accordion animation
    await expect(card).toHaveScreenshot('qantas-expanded.png', { maxDiffPixelRatio: 0.02 });
  });

  test('full page — desktop', async ({ page }) => {
    await page.goto('/');
    await waitForFonts(page);
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
    await waitForFonts(page);
    await page.waitForTimeout(400);
    await expect(page.locator('.tq-hero__stats')).toHaveScreenshot('quality-suite-hero-stats.png', {
      maxDiffPixelRatio: 0.02,
    });
  });

  test('pipeline with PR Checks panel open', async ({ page }) => {
    await page.goto('/testing.html');
    await waitForFonts(page);
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
    await waitForFonts(page);
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
