import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('displays hero name and role', async ({ page }) => {
    await expect(page.locator('h1.hero__name')).toBeVisible();
    await expect(page.locator('h1.hero__name')).toHaveText('Siddharth Salunke');
    await expect(page.locator('p.hero__role')).toContainText('Principal Engineer');
  });

  test('nav contains expected section links', async ({ page }) => {
    for (const label of ['About', 'Experience', 'Education', 'Skills']) {
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
    const headings = ['Platform leadership, through a quality lens.', "Where I\u2019ve worked.", 'Where it started.', 'What I work with.'];
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

// ── testing.html and ai-engineering.html ────────────────────────────────────
// These pages share the same nav component but link back to index.html's
// sections (no local #anchor targets) and mark their own nav link as the
// current page — worth its own coverage rather than assuming index.html's
// nav behavior generalizes.

const SUB_PAGES = [
  { name: 'Quality Suite page',    path: '/testing.html',        currentLabel: 'Quality Suite' },
  { name: 'AI Engineering page',   path: '/ai-engineering.html', currentLabel: 'AI Engineering' },
];

for (const { name, path, currentLabel } of SUB_PAGES) {
  test.describe(`Navigation — ${name}`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(path);
    });

    test('nav contains expected links, pointing back at index.html sections', async ({ page }) => {
      for (const label of ['About', 'Experience', 'Education', 'Skills']) {
        const link = page.locator(`.nav__link:has-text("${label}")`);
        await expect(link).toBeVisible();
        await expect(link).toHaveAttribute('href', new RegExp(`index\\.html#${label.toLowerCase()}`));
      }
    });

    test(`"${currentLabel}" nav link is marked as the current page`, async ({ page }) => {
      await expect(page.locator('.nav__link[aria-current="page"]')).toHaveText(currentLabel);
    });

    test('nav gets glassmorphism class after scroll', async ({ page }) => {
      await page.evaluate(() => window.scrollTo(0, 100));
      await expect(page.locator('#main-nav')).toHaveClass(/nav--scrolled/);
    });

    test('nav logo navigates back to the homepage', async ({ page }) => {
      await page.locator('.nav__logo').click();
      await expect(page).toHaveURL(/\/$/);
    });
  });
}
