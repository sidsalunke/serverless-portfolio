import { test, expect } from '@playwright/test';

test.describe('Education', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('both institutions are listed', async ({ page }) => {
    const institutions = ['University of Technology Sydney', 'MITSOM College'];
    for (const name of institutions) {
      await expect(page.locator(`.exp__company:has-text("${name}")`)).toBeVisible();
    }
  });

  test('both degrees are visible without needing to expand', async ({ page }) => {
    await expect(page.locator('#education .exp__role', { hasText: 'Master of Information Technology' })).toBeVisible();
    await expect(page.locator('#education .exp__role', { hasText: 'Bachelor of Computer Applications' })).toBeVisible();
    await expect(page.locator('#education .exp__bullet').first()).toBeVisible();
  });

  test('education cards have no expand chevron', async ({ page }) => {
    await expect(page.locator('#education .exp__chevron')).toHaveCount(0);
  });

  test('exactly 2 education cards are present', async ({ page }) => {
    await expect(page.locator('#education .exp__card')).toHaveCount(2);
  });
});
