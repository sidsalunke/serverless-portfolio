import { test, expect } from '@playwright/test';

test.describe('Education', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('both institutions are listed', async ({ page }) => {
    const education = page.getByRole('region', { name: 'Where it started.' });
    const institutions = ['University of Technology Sydney', 'MITSOM College'];
    for (const name of institutions) {
      await expect(education.getByText(name, { exact: true })).toBeVisible();
    }
  });

  test('both degrees are visible without needing to expand', async ({ page }) => {
    const education = page.getByRole('region', { name: 'Where it started.' });
    await expect(education.getByText('Master of Information Technology')).toBeVisible();
    await expect(education.getByText('Bachelor of Computer Applications')).toBeVisible();
    await expect(education.getByRole('listitem').first()).toBeVisible();
  });

  test('education cards have no expand button', async ({ page }) => {
    const education = page.getByRole('region', { name: 'Where it started.' });
    await expect(education.getByRole('button')).toHaveCount(0);
  });

  test('exactly 2 education cards are present', async ({ page }) => {
    const education = page.getByRole('region', { name: 'Where it started.' });
    await expect(education.getByRole('article')).toHaveCount(2);
  });
});
