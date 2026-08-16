import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility (axe WCAG 2.1 AA)', () => {
  test('full page has no violations on load', async ({ page }) => {
    await page.goto('/');
    // Let scroll-reveal's opacity transition (600ms) settle before axe scans —
    // otherwise a mid-transition sample can read as a transient contrast
    // failure that isn't present in the final rendered state.
    await page.waitForTimeout(700);
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();
    expect(results.violations).toEqual([]);
  });

  test('page has no violations with accordion expanded', async ({ page }) => {
    await page.goto('/');
    // Let scroll-reveal's opacity transition (600ms) settle before axe scans —
    // otherwise a mid-transition sample can read as a transient contrast
    // failure that isn't present in the final rendered state.
    await page.waitForTimeout(700);
    await page.locator('[aria-label="Software Technical Lead at Qantas Airways"] .exp__header').click();
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();
    expect(results.violations).toEqual([]);
  });

  test('page has no violations with mobile drawer open', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    // Let scroll-reveal's opacity transition (600ms) settle before axe scans —
    // otherwise a mid-transition sample can read as a transient contrast
    // failure that isn't present in the final rendered state.
    await page.waitForTimeout(700);
    await page.locator('#nav-hamburger').click();
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();
    expect(results.violations).toEqual([]);
  });
});

// jsdom (tests/a11y/accessibility.test.js) can't reliably compute real color
// contrast — its HTMLCanvasElement.getContext isn't implemented, so contrast
// checks are effectively no-ops there. This real-browser suite is the one
// that actually catches contrast regressions (confirmed earlier this
// project — an accent-color change silently dropped a label below 4.5:1 and
// only this Playwright suite caught it). Cover all indexable pages, not
// just index.html.
test.describe('Accessibility (axe WCAG 2.1 AA) — Quality Suite page', () => {
  test('full page has no violations on load', async ({ page }) => {
    await page.goto('/testing.html');
    await page.waitForTimeout(700); // let scroll-reveal settle — see comment above
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();
    expect(results.violations).toEqual([]);
  });

  test('page has no violations with a pipeline panel expanded', async ({ page }) => {
    await page.goto('/testing.html');
    await page.waitForTimeout(700); // let scroll-reveal settle — see comment above
    await page.locator('.tq-pipeline__node--clickable').first().click();
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();
    expect(results.violations).toEqual([]);
  });

  test('page has no violations with mobile drawer open', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/testing.html');
    await page.waitForTimeout(700); // let scroll-reveal settle — see comment above
    await page.locator('#nav-hamburger').click();
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();
    expect(results.violations).toEqual([]);
  });
});

test.describe('Accessibility (axe WCAG 2.1 AA) — AI Engineering page', () => {
  test('full page has no violations on load', async ({ page }) => {
    await page.goto('/ai-engineering.html');
    await page.waitForTimeout(700); // let scroll-reveal settle — see comment above
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();
    expect(results.violations).toEqual([]);
  });

  test('page has no violations with mobile drawer open', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/ai-engineering.html');
    await page.waitForTimeout(700); // let scroll-reveal settle — see comment above
    await page.locator('#nav-hamburger').click();
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();
    expect(results.violations).toEqual([]);
  });
});
