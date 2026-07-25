import { test, expect } from '@playwright/test';

/**
 * E2E tests for ai-engineering.html — AI Engineering page.
 * Covers page load, nav state, hero stats, and section content.
 */

test.describe('AI Engineering page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/ai-engineering.html');
  });

  test('page title is correct', async ({ page }) => {
    await expect(page).toHaveTitle(/AI Engineering/);
  });

  test('h1 reads "AI Engineering"', async ({ page }) => {
    await expect(page.locator('h1')).toHaveText('AI Engineering');
  });

  test('nav AI Engineering link is marked as current page', async ({ page }) => {
    await expect(page.locator('.nav__link[aria-current="page"]')).toHaveText('AI Engineering');
  });

  test('nav logo links back to index.html', async ({ page }) => {
    await expect(page.locator('.nav__logo')).toHaveAttribute('href', 'index.html');
  });

  test('hero displays 4 stats', async ({ page }) => {
    const stats = page.locator('.tq-hero__stats .hero__stat');
    await expect(stats).toHaveCount(4);
  });

  test('workflow section lists all AI tools', async ({ page }) => {
    for (const name of ['Claude Code', 'GitLab Duo', 'MCP']) {
      await expect(page.locator('.tq-card__name', { hasText: name })).toBeVisible();
    }
  });

  test('shipped-at-work section lists both case studies', async ({ page }) => {
    const cards = page.locator('#work-heading').locator('xpath=ancestor::section').locator('.tq-deploy-card');
    await expect(cards).toHaveCount(2);
  });

  test('beyond-work section lists both personal projects', async ({ page }) => {
    await expect(page.locator('.tq-card__name', { hasText: 'Content Strategy Analytics' })).toBeVisible();
    await expect(page.locator('.tq-card__name', { hasText: 'Personal Tax Estimation Agent' })).toBeVisible();
  });

  test('all section headings are present', async ({ page }) => {
    const headings = ['How I work with AI.', 'Disciplined, not default.', 'Tools built with it.', 'Applied AI, off the clock.'];
    for (const text of headings) {
      await expect(page.locator(`h2:has-text("${text}")`)).toBeAttached();
    }
  });
});
