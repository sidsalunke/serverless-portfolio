import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('displays hero name and role', async ({ page }) => {
    await expect(page.locator('h1.hero__name')).toBeVisible();
    await expect(page.locator('h1.hero__name')).toHaveText('Siddharth Salunke');
    await expect(page.locator('p.hero__role')).toContainText('Principal Quality Engineer');
  });

  test('nav contains expected section links', async ({ page }) => {
    for (const label of ['About', 'Experience', 'Skills']) {
      await expect(page.locator(`.nav__link:has-text("${label}")`)).toBeVisible();
    }
  });

  test('nav gets glassmorphism class after scroll', async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, 100));
    await expect(page.locator('#main-nav')).toHaveClass(/nav--scrolled/);
  });

  test('clicking nav logo scrolls back to top', async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.locator('.nav__logo').click();
    await expect(page).toHaveURL(/#hero/);
  });

  test('all section headings are present', async ({ page }) => {
    const headings = ['Engineering quality at scale.', "Where I\u2019ve worked.", 'What I work with.'];
    for (const text of headings) {
      await expect(page.locator(`h2:has-text("${text}")`)).toBeAttached();
    }
  });

  test('LinkedIn and GitHub CTA buttons link correctly', async ({ page }) => {
    const linkedin = page.locator('.hero__ctas a').first();
    await expect(linkedin).toHaveAttribute('href', /linkedin\.com/);
    await expect(linkedin).toHaveAttribute('target', '_blank');

    const github = page.locator('.hero__ctas a').last();
    await expect(github).toHaveAttribute('href', /github\.com/);
    await expect(github).toHaveAttribute('target', '_blank');
  });
});
