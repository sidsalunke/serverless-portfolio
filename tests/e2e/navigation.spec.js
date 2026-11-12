import { test, expect } from '@playwright/test';

// On a phone-width project the links live in a drawer that is hidden
// (visibility: hidden) until the hamburger opens it.
async function revealNavLinks(page) {
  const hamburger = page.getByRole('button', { name: 'Toggle navigation menu' });
  if (await hamburger.isVisible()) await hamburger.click();
}

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('displays hero name and role', async ({ page }) => {
    const hero = page.getByRole('region', { name: 'Introduction' });
    await expect(page.getByRole('heading', { level: 1, name: 'Siddharth Salunke' })).toBeVisible();
    await expect(hero.getByText('Principal Quality Engineer', { exact: false })).toBeVisible();
  });

  test('nav contains expected section links', async ({ page }) => {
    const nav = page.getByRole('navigation', { name: 'Main navigation' });
    await revealNavLinks(page);
    for (const label of ['About', 'Experience', 'Education', 'Skills']) {
      await expect(nav.getByRole('link', { name: label, exact: true })).toBeVisible();
    }
  });

  test('nav gets glassmorphism class after scroll', async ({ page }) => {
    const nav = page.getByRole('navigation', { name: 'Main navigation' });
    await page.evaluate(() => window.scrollTo(0, 100));
    await expect(nav).toHaveClass(/nav--scrolled/);
  });

  test('clicking nav logo scrolls back to top', async ({ page }) => {
    const nav = page.getByRole('navigation', { name: 'Main navigation' });
    await page.evaluate(() => window.scrollTo(0, 500));
    await nav.getByRole('link', { name: 'SS' }).click();
    await expect(page).toHaveURL(/#hero/);
  });

  test('all section headings are present', async ({ page }) => {
    const headings = ['Platform leadership, through a quality lens.', "Where I’ve worked.", 'Where it started.', 'What I work with.'];
    for (const text of headings) {
      await expect(page.getByRole('heading', { level: 2, name: text })).toBeAttached();
    }
  });

  test('LinkedIn and GitHub CTA buttons link correctly', async ({ page }) => {
    const hero = page.getByRole('region', { name: 'Introduction' });

    const linkedin = hero.getByRole('link', { name: 'LinkedIn' });
    await expect(linkedin).toHaveAttribute('href', /linkedin\.com/);
    await expect(linkedin).toHaveAttribute('target', '_blank');

    const github = hero.getByRole('link', { name: 'GitHub' });
    await expect(github).toHaveAttribute('href', /github\.com/);
    await expect(github).toHaveAttribute('target', '_blank');
  });
});

// ── /testing and /ai-engineering ────────────────────────────────────────────
// These pages share the same nav component but link back to the homepage's
// sections (no local #anchor targets) and mark their own nav link as the
// current page — worth its own coverage rather than assuming the homepage's
// nav behavior generalizes.

const SUB_PAGES = [
  { name: 'Quality Suite page',    path: '/testing',        currentLabel: 'Quality Suite' },
  { name: 'AI Engineering page',   path: '/ai-engineering', currentLabel: 'AI Engineering' },
];

for (const { name, path, currentLabel } of SUB_PAGES) {
  test.describe(`Navigation — ${name}`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(path);
    });

    test('nav contains expected links, pointing back at the homepage sections', async ({ page }) => {
      const nav = page.getByRole('navigation', { name: 'Main navigation' });
      await revealNavLinks(page);
      for (const label of ['About', 'Experience', 'Education', 'Skills']) {
        const link = nav.getByRole('link', { name: label, exact: true });
        await expect(link).toBeVisible();
        await expect(link).toHaveAttribute('href', new RegExp(`/#${label.toLowerCase()}`));
      }
    });

    test(`"${currentLabel}" nav link is marked as the current page`, async ({ page }) => {
      const nav = page.getByRole('navigation', { name: 'Main navigation' });
      // aria-current is a genuine ARIA state (not a styling hook), so an
      // attribute match here is the correct locator, not a CSS-brittleness risk.
      await expect(nav.locator('[aria-current="page"]')).toHaveText(currentLabel);
    });

    test('nav gets glassmorphism class after scroll', async ({ page }) => {
      const nav = page.getByRole('navigation', { name: 'Main navigation' });
      await page.evaluate(() => window.scrollTo(0, 100));
      await expect(nav).toHaveClass(/nav--scrolled/);
    });

    test('nav logo navigates back to the homepage', async ({ page }) => {
      const nav = page.getByRole('navigation', { name: 'Main navigation' });
      await nav.getByRole('link', { name: 'SS' }).click();
      await expect(page).toHaveURL(/\/$/);
    });
  });
}

// ── Skip link (WCAG 2.4.1 Bypass Blocks) ──
for (const path of ['/', '/testing', '/ai-engineering', '/writing', '/writing/rollback-static-site-s3-cloudfront']) {
  test.describe(`Skip link — ${path}`, () => {
    test('is the first Tab stop, becomes visible, and jumps past the nav', async ({ page }) => {
      await page.goto(path);
      const skip = page.getByRole('link', { name: 'Skip to main content' });

      // Off screen until it has focus.
      await expect(skip).not.toBeInViewport();

      await page.keyboard.press('Tab');
      await expect(skip).toBeFocused();
      await expect(skip).toBeInViewport();

      await page.keyboard.press('Enter');
      await expect(page).toHaveURL(/#main-content$/);

      // The next Tab stop is past the navigation: inside <main>, or after it
      // on a page whose <main> has nothing focusable.
      await page.keyboard.press('Tab');
      const where = await page.evaluate(() => {
        const el = document.activeElement;
        const main = document.querySelector('main');
        return {
          inNav: !!el.closest('nav'),
          atOrAfterMain: main.contains(el) ||
            !!(main.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING),
        };
      });
      expect(where).toEqual({ inNav: false, atOrAfterMain: true });
    });
  });
}
