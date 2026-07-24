import { test, expect } from '@playwright/test';

test.describe('Experience accordion', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('all 6 companies are listed', async ({ page }) => {
    const companies = ['Emirates Group', 'Qantas Airways', 'Canva', 'MYOB Group', 'Suncorp Group', 'Cognizant'];
    for (const name of companies) {
      await expect(page.locator(`.exp__company:has-text("${name}")`)).toBeVisible();
    }
  });

  test('Emirates card has no expand chevron (current role)', async ({ page }) => {
    const card = page.locator('[aria-label="Principal Quality Engineer at Emirates Group"]');
    await expect(card.locator('.exp__chevron')).toHaveCount(0);
  });

  test('Qantas card expands on click', async ({ page }) => {
    const card = page.locator('[aria-label="Software Technical Lead at Qantas Airways"]');
    await card.locator('.exp__header').click();
    await expect(card).toHaveClass(/exp__card--expanded/);
    await expect(card.locator('.exp__details')).toHaveClass(/exp__details--open/);
    await expect(card.locator('.exp__chevron')).toHaveClass(/exp__chevron--open/);
  });

  test('Qantas card collapses on second click', async ({ page }) => {
    const card = page.locator('[aria-label="Software Technical Lead at Qantas Airways"]');
    await card.locator('.exp__header').click();
    await card.locator('.exp__header').click();
    await expect(card).not.toHaveClass(/exp__card--expanded/);
    await expect(card.locator('.exp__details')).not.toHaveClass(/exp__details--open/);
  });

  test('only one card is expanded at a time', async ({ page }) => {
    await page.locator('[aria-label="Software Technical Lead at Qantas Airways"] .exp__header').click();
    await page.locator('[aria-label="QA Manager at Canva"] .exp__header').click();
    await expect(page.locator('.exp__card--expanded')).toHaveCount(1);
  });

  test('expanded card shows responsibilities', async ({ page }) => {
    const card = page.locator('[aria-label="Software Technical Lead at Qantas Airways"]');
    await card.locator('.exp__header').click();
    await expect(card.locator('.exp__bullet')).toHaveCount(5);
  });

  test('each expandable card has a Visit link', async ({ page }) => {
    const expandable = page.locator('.exp__card--expandable');
    const count = await expandable.count();
    for (let i = 0; i < count; i++) {
      await expandable.nth(i).locator('.exp__header').click();
      await expect(expandable.nth(i).locator('.exp__ext-link')).toBeVisible();
      await expandable.nth(i).locator('.exp__header').click(); // close
    }
  });

  test('accordion is keyboard accessible', async ({ page }) => {
    const header = page.locator('[aria-label="QA Manager at Canva"] .exp__header');
    await header.focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('[aria-label="QA Manager at Canva"]')).toHaveClass(/exp__card--expanded/);
    await page.keyboard.press('Space');
    await expect(page.locator('[aria-label="QA Manager at Canva"]')).not.toHaveClass(/exp__card--expanded/);
  });
});
