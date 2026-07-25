import { test, expect } from '@playwright/test';

/**
 * E2E tests for testing.html — Quality Suite page.
 * Covers page load, hero stats, pipeline interaction, and panel content.
 */

test.describe('Quality Suite page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/testing.html');
  });

  // ── Page basics ──────────────────────────────────────────────

  test('page title is correct', async ({ page }) => {
    await expect(page).toHaveTitle(/Quality Suite/);
  });

  test('h1 reads "Quality Suite"', async ({ page }) => {
    await expect(page.locator('h1')).toHaveText('Quality Suite');
  });

  test('nav Quality Suite link is marked as current page', async ({ page }) => {
    await expect(page.locator('.nav__link[aria-current="page"]')).toHaveText('Quality Suite');
  });

  test('nav logo links back to index.html', async ({ page }) => {
    await expect(page.locator('.nav__logo')).toHaveAttribute('href', 'index.html');
  });

  // ── Hero stats ───────────────────────────────────────────────

  test('hero displays 5 stats', async ({ page }) => {
    const stats = page.locator('.tq-hero__stats .hero__stat');
    await expect(stats).toHaveCount(5);
  });

  test('highlighted stats show Accessibility, SEO and Performance', async ({ page }) => {
    const highlights = page.locator('.hero__stat--highlight .hero__stat-label');
    await expect(highlights).toHaveCount(3);
    await expect(highlights.nth(0)).toHaveText('Accessibility');
    await expect(highlights.nth(1)).toHaveText('SEO Score');
    await expect(highlights.nth(2)).toHaveText('Performance');
  });

  // ── Pipeline nodes ───────────────────────────────────────────

  test('three clickable pipeline nodes are present', async ({ page }) => {
    const nodes = page.locator('.tq-pipeline__node--clickable');
    await expect(nodes).toHaveCount(3);
  });

  test('all panels are hidden on load', async ({ page }) => {
    for (const id of ['panel-pr-checks', 'panel-deploy', 'panel-live-verify']) {
      await expect(page.locator(`#${id}`)).toBeHidden();
    }
  });

  // ── Pipeline interaction ─────────────────────────────────────

  test('clicking PR Checks reveals its panel', async ({ page }) => {
    await page.locator('[data-panel="panel-pr-checks"]').click();
    await expect(page.locator('#panel-pr-checks')).toBeVisible();
  });

  test('clicking the same node again hides the panel', async ({ page }) => {
    const node = page.locator('[data-panel="panel-pr-checks"]');
    await node.click();
    await expect(page.locator('#panel-pr-checks')).toBeVisible();
    await node.click();
    await expect(page.locator('#panel-pr-checks')).toBeHidden();
  });

  test('active node gets aria-expanded="true"', async ({ page }) => {
    const node = page.locator('[data-panel="panel-pr-checks"]');
    await node.click();
    await expect(node).toHaveAttribute('aria-expanded', 'true');
  });

  test('clicking a different node closes the first panel', async ({ page }) => {
    await page.locator('[data-panel="panel-pr-checks"]').click();
    await expect(page.locator('#panel-pr-checks')).toBeVisible();

    await page.locator('[data-panel="panel-deploy"]').click();
    await expect(page.locator('#panel-pr-checks')).toBeHidden();
    await expect(page.locator('#panel-deploy')).toBeVisible();
  });

  test('only one panel is open at a time', async ({ page }) => {
    for (const panelId of ['panel-pr-checks', 'panel-deploy', 'panel-live-verify']) {
      await page.locator(`[data-panel="${panelId}"]`).click();
    }
    const visiblePanels = page.locator('.tq-panel:visible');
    await expect(visiblePanels).toHaveCount(1);
  });

  test('Enter key opens a pipeline panel', async ({ page }) => {
    const node = page.locator('[data-panel="panel-pr-checks"]');
    await node.focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('#panel-pr-checks')).toBeVisible();
  });

  test('Space key opens a pipeline panel', async ({ page }) => {
    const node = page.locator('[data-panel="panel-deploy"]');
    await node.focus();
    await page.keyboard.press('Space');
    await expect(page.locator('#panel-deploy')).toBeVisible();
  });

  // ── Panel content ────────────────────────────────────────────

  test('PR Checks panel lists all 3 job columns', async ({ page }) => {
    await page.locator('[data-panel="panel-pr-checks"]').click();
    const panel = page.locator('#panel-pr-checks');
    await expect(panel.locator('.tq-panel__col-name', { hasText: 'Static Tests' })).toBeVisible();
    await expect(panel.locator('.tq-panel__col-name', { hasText: 'Security Scan' })).toBeVisible();
    await expect(panel.locator('.tq-panel__col-name', { hasText: 'Playwright E2E' })).toBeVisible();
  });

  test('Deploy panel mentions AWS and Terraform', async ({ page }) => {
    await page.locator('[data-panel="panel-deploy"]').click();
    const panel = page.locator('#panel-deploy');
    await expect(panel.locator('.tq-panel__col-name', { hasText: 'AWS Stack' })).toBeVisible();
    await expect(panel.locator('.tq-panel__col-name', { hasText: 'Infrastructure as Code' })).toBeVisible();
  });

  test('Live Verify panel covers rollback', async ({ page }) => {
    await page.locator('[data-panel="panel-live-verify"]').click();
    const panel = page.locator('#panel-live-verify');
    await expect(panel.locator('.tq-panel__col-name', { hasText: 'Auto-Rollback' })).toBeVisible();
  });

  // ── Stage sections ───────────────────────────────────────────

  test('Stage 01 has 3 job blocks', async ({ page }) => {
    await expect(page.locator('.tq-job')).toHaveCount(3);
  });

  test('Stage 02 deploy grid has 4 cards', async ({ page }) => {
    await expect(page.locator('.tq-deploy-card')).toHaveCount(4);
  });
});
