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

test.describe('Visual regression', () => {
  test('hero section', async ({ page }) => {
    await page.goto('/');
    await page.waitForFunction(() => document.fonts.ready);
    await page.waitForTimeout(400);
    await expect(page.locator('.hero__content')).toHaveScreenshot('hero-content.png', {
      maxDiffPixelRatio: 0.02,
    });
  });

  test('skills grid', async ({ page }) => {
    await page.goto('/');
    await page.waitForFunction(() => document.fonts.ready);
    await page.locator('#skills').scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    await expect(page.locator('.skills__grid')).toHaveScreenshot('skills-grid.png', {
      maxDiffPixelRatio: 0.02,
    });
  });

  test('experience card expanded', async ({ page }) => {
    await page.goto('/');
    await page.waitForFunction(() => document.fonts.ready);
    await page.locator('[aria-label="Software Technical Lead at Qantas Airways"] .exp__header').click();
    await page.waitForTimeout(500); // accordion animation
    await expect(
      page.locator('[aria-label="Software Technical Lead at Qantas Airways"]')
    ).toHaveScreenshot('qantas-expanded.png', { maxDiffPixelRatio: 0.02 });
  });

  test('full page — desktop', async ({ page }) => {
    await page.goto('/');
    await page.waitForFunction(() => document.fonts.ready);
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
    await page.waitForFunction(() => document.fonts.ready);
    await page.waitForTimeout(400);
    await expect(page.locator('.tq-hero__stats')).toHaveScreenshot('quality-suite-hero-stats.png', {
      maxDiffPixelRatio: 0.02,
    });
  });

  test('pipeline with PR Checks panel open', async ({ page }) => {
    await page.goto('/testing.html');
    await page.waitForFunction(() => document.fonts.ready);
    await page.locator('[data-panel="panel-pr-checks"]').click();
    await page.waitForTimeout(300);
    await expect(page.locator('.tq-pipeline-section')).toHaveScreenshot('quality-suite-pipeline-panel.png', {
      maxDiffPixelRatio: 0.02,
    });
  });

});
