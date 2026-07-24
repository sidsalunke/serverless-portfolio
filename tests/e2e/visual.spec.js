import { test, expect } from '@playwright/test';

/**
 * Visual regression tests — pixel-level screenshot comparisons.
 *
 * First run: Playwright creates baseline images in tests/e2e/__screenshots__/
 * Subsequent runs: fails if pixels differ beyond threshold.
 * To update baselines intentionally: npx playwright test --update-snapshots
 */

test.describe('Visual regression', () => {
  test('hero section', async ({ page }) => {
    await page.goto('/');
    // Wait for CSS animations to settle
    await page.waitForTimeout(600);
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
    await page.locator('[aria-label="Software Technical Lead at Qantas Airways"] .exp__header').click();
    await page.waitForTimeout(500); // accordion animation
    await expect(
      page.locator('[aria-label="Software Technical Lead at Qantas Airways"]')
    ).toHaveScreenshot('qantas-expanded.png', { maxDiffPixelRatio: 0.02 });
  });

  test('full page — desktop', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(600);
    await expect(page).toHaveScreenshot('full-page-desktop.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.02,
    });
  });
});
