import { test, expect } from '@playwright/test';

test.describe('Experience accordion', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('all 6 companies are listed', async ({ page }) => {
    const experience = page.getByRole('region', { name: "Where I’ve worked." });
    const companies = ['Emirates Group', 'Qantas Airways', 'Canva', 'MYOB Group', 'Suncorp Group', 'Cognizant'];
    for (const name of companies) {
      await expect(experience.getByText(name, { exact: true })).toBeVisible();
    }
  });

  test('Emirates card has no expand button (current role)', async ({ page }) => {
    const card = page.getByRole('article', { name: 'Principal Quality Engineer at Emirates Group' });
    await expect(card.getByRole('button')).toHaveCount(0);
  });

  test('Qantas card expands on click', async ({ page }) => {
    const card = page.getByRole('article', { name: 'Software Technical Lead at Qantas Airways' });
    const header = card.getByRole('button');
    await header.click();
    await expect(header).toHaveAttribute('aria-expanded', 'true');
    await expect(card.getByText('Australia’s largest domestic', { exact: false })).toBeVisible();
  });

  test('Qantas card collapses on second click', async ({ page }) => {
    const card = page.getByRole('article', { name: 'Software Technical Lead at Qantas Airways' });
    const header = card.getByRole('button');
    await header.click();
    await header.click();
    await expect(header).toHaveAttribute('aria-expanded', 'false');
  });

  test('only one card is expanded at a time', async ({ page }) => {
    const qantas = page.getByRole('article', { name: 'Software Technical Lead at Qantas Airways' });
    const canva  = page.getByRole('article', { name: 'QA Manager at Canva' });
    await qantas.getByRole('button').click();
    await canva.getByRole('button').click();
    await expect(qantas.getByRole('button')).toHaveAttribute('aria-expanded', 'false');
    await expect(canva.getByRole('button')).toHaveAttribute('aria-expanded', 'true');
  });

  test('expanded card shows responsibilities', async ({ page }) => {
    const card = page.getByRole('article', { name: 'Software Technical Lead at Qantas Airways' });
    await card.getByRole('button').click();
    await expect(card.getByRole('listitem')).toHaveCount(5);
  });

  test('each expandable card has a Visit link', async ({ page }) => {
    const cards = page.getByRole('article').filter({ has: page.getByRole('button') });
    const count = await cards.count();
    for (let i = 0; i < count; i++) {
      const card = cards.nth(i);
      await card.getByRole('button').click();
      await expect(card.getByRole('link', { name: /^Visit/ })).toBeVisible();
      await card.getByRole('button').click(); // close
    }
  });

  test('accordion is keyboard accessible', async ({ page }) => {
    const canva  = page.getByRole('article', { name: 'QA Manager at Canva' });
    const header = canva.getByRole('button');
    await header.focus();
    await page.keyboard.press('Enter');
    await expect(header).toHaveAttribute('aria-expanded', 'true');
    await page.keyboard.press('Space');
    await expect(header).toHaveAttribute('aria-expanded', 'false');
  });
});
