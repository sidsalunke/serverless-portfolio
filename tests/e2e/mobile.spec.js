import { test, expect } from '@playwright/test';

// All tests in this file run at a mobile viewport
test.use({ viewport: { width: 375, height: 812 } });

test.describe('Mobile navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('hamburger button is visible on mobile', async ({ page }) => {
    await expect(page.locator('#nav-hamburger')).toBeVisible();
  });

  test('hamburger opens the nav drawer', async ({ page }) => {
    await page.locator('#nav-hamburger').click();
    await expect(page.locator('#nav-links')).toHaveClass(/nav__links--open/);
    await expect(page.locator('#nav-hamburger')).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('#nav-hamburger')).toHaveClass(/nav__hamburger--open/);
  });

  test('backdrop appears when drawer is open', async ({ page }) => {
    await page.locator('#nav-hamburger').click();
    await expect(page.locator('.nav__backdrop')).toBeAttached();
  });

  test('clicking backdrop closes the drawer', async ({ page }) => {
    await page.locator('#nav-hamburger').click();
    // Click the left edge of the backdrop — the right side is covered by the 28rem drawer
    await page.locator('.nav__backdrop').click({ position: { x: 50, y: 400 } });
    await expect(page.locator('#nav-links')).not.toHaveClass(/nav__links--open/);
    await expect(page.locator('.nav__backdrop')).toHaveCount(0);
  });

  test('clicking a nav link closes the drawer', async ({ page }) => {
    await page.locator('#nav-hamburger').click();
    await page.locator('.nav__link').first().click();
    await expect(page.locator('#nav-links')).not.toHaveClass(/nav__links--open/);
  });

  test('content is readable without horizontal scroll', async ({ page }) => {
    const scrollWidth  = await page.evaluate(() => document.body.scrollWidth);
    const clientWidth  = await page.evaluate(() => document.body.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
  });
});
