import { test, expect } from '@playwright/test';

// All tests in this file run at a mobile viewport
test.use({ viewport: { width: 375, height: 812 } });

const PAGES = [
  { name: 'index',           path: '/' },
  { name: 'testing',         path: '/testing' },
  { name: 'ai-engineering',  path: '/ai-engineering' },
];

for (const { name, path } of PAGES) {
  test.describe(`Mobile navigation — ${name}`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(path);
    });

    test('hamburger button is visible on mobile', async ({ page }) => {
      await expect(page.getByRole('button', { name: 'Toggle navigation menu' })).toBeVisible();
    });

    test('hamburger opens the nav drawer', async ({ page }) => {
      const hamburger = page.getByRole('button', { name: 'Toggle navigation menu' });
      await hamburger.click();
      await expect(hamburger).toHaveAttribute('aria-expanded', 'true');
      await expect(page.getByRole('navigation', { name: 'Main navigation' })).toBeVisible();
    });

    test('backdrop appears when drawer is open', async ({ page }) => {
      await page.getByRole('button', { name: 'Toggle navigation menu' }).click();
      // Purely decorative (aria-hidden) — no accessible role/name, so a
      // data-testid hook is the correct locator here, not a CSS class.
      await expect(page.getByTestId('nav-backdrop')).toBeAttached();
    });

    test('clicking backdrop closes the drawer', async ({ page }) => {
      const hamburger = page.getByRole('button', { name: 'Toggle navigation menu' });
      await hamburger.click();
      // Click the left edge of the backdrop — the right side is covered by the 28rem drawer
      await page.getByTestId('nav-backdrop').click({ position: { x: 50, y: 400 } });
      await expect(hamburger).toHaveAttribute('aria-expanded', 'false');
      await expect(page.getByTestId('nav-backdrop')).toHaveCount(0);
    });

    test('clicking a nav link closes the drawer', async ({ page }) => {
      const hamburger = page.getByRole('button', { name: 'Toggle navigation menu' });
      await hamburger.click();
      await page.getByRole('navigation', { name: 'Main navigation' })
        .getByRole('list')
        .getByRole('link')
        .first()
        .click();
      await expect(hamburger).toHaveAttribute('aria-expanded', 'false');
    });

    test('content is readable without horizontal scroll', async ({ page }) => {
      const scrollWidth  = await page.evaluate(() => document.body.scrollWidth);
      const clientWidth  = await page.evaluate(() => document.body.clientWidth);
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
    });
  });
}
