import { test, expect } from '@playwright/test';

/**
 * E2E tests for ai-engineering.html — AI Engineering page.
 * Covers page load, nav state, hero stats, and section content.
 */

test.describe('AI Engineering page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/ai-engineering');
  });

  test('page title is correct', async ({ page }) => {
    await expect(page).toHaveTitle(/AI Engineering/);
  });

  test('h1 reads "AI Engineering"', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('AI Engineering');
  });

  test('nav AI Engineering link is marked as current page', async ({ page }) => {
    const nav = page.getByRole('navigation', { name: 'Main navigation' });
    // aria-current is a genuine ARIA state (not a styling hook), so an
    // attribute match here is the correct locator, not a CSS-brittleness risk.
    await expect(nav.locator('[aria-current="page"]')).toHaveText('AI Engineering');
  });

  test('nav logo links back to the homepage', async ({ page }) => {
    const nav = page.getByRole('navigation', { name: 'Main navigation' });
    await expect(nav.getByRole('link', { name: 'SS' })).toHaveAttribute('href', '/');
  });

  test('hero displays 4 stats', async ({ page }) => {
    const hero = page.getByRole('region', { name: 'AI Engineering' });
    await expect(hero.getByRole('listitem')).toHaveCount(4);
  });

  test('workflow section lists all AI tools', async ({ page }) => {
    const section = page.getByRole('region', { name: 'How I work with AI.' });
    for (const name of ['Claude Code', 'GitLab Duo', 'MCP']) {
      await expect(section.getByText(name, { exact: true }).first()).toBeVisible();
    }
  });

  test('shipped-at-work section lists both case studies', async ({ page }) => {
    const section = page.getByRole('region', { name: 'Tools built with it.' });
    await expect(section.locator('.tq-deploy-card')).toHaveCount(2);
  });

  test('beyond-work section lists both personal projects', async ({ page }) => {
    await expect(page.getByText('Content Strategy Analytics', { exact: true })).toBeVisible();
    await expect(page.getByText('Personal Tax Estimation Agent', { exact: true })).toBeVisible();
  });

  test('all section headings are present', async ({ page }) => {
    const headings = ['How I work with AI.', 'Disciplined, not default.', 'Tools built with it.', 'Applied AI, off the clock.'];
    for (const text of headings) {
      await expect(page.getByRole('heading', { level: 2, name: text })).toBeAttached();
    }
  });
});
