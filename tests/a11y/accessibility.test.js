'use strict';

/**
 * Accessibility tests using jest-axe.
 * Loads the real index.html and runs axe-core WCAG 2.1 AA checks.
 */

const fs   = require('fs');
const path = require('path');
const { axe, toHaveNoViolations } = require('jest-axe');

expect.extend(toHaveNoViolations);

const html = fs.readFileSync(path.join(__dirname, '../../index.html'), 'utf8');

test('index.html has no WCAG 2.1 AA accessibility violations', async () => {
  // jest-axe accepts a raw HTML string and runs axe against it
  const results = await axe(html, {
    runOnly: {
      type: 'tag',
      values: ['wcag2a', 'wcag2aa'],
    },
  });
  expect(results).toHaveNoViolations();
}, 15_000);

test('all images have alt text', () => {
  document.documentElement.innerHTML = html;
  const images = document.querySelectorAll('img');
  images.forEach(img => {
    expect(img.getAttribute('alt')).toBeTruthy();
  });
});

test('all interactive elements are keyboard-reachable', () => {
  document.documentElement.innerHTML = html;
  const interactive = document.querySelectorAll('a, button, [role="button"]');
  interactive.forEach(el => {
    const tabindex = el.getAttribute('tabindex');
    // tabindex="-1" intentionally removes from tab order; anything else is fine
    expect(tabindex).not.toBe('-1');
  });
});

test('page has a single h1', () => {
  document.documentElement.innerHTML = html;
  expect(document.querySelectorAll('h1').length).toBe(1);
});

test('landmark regions are present', () => {
  document.documentElement.innerHTML = html;
  expect(document.querySelector('nav')).not.toBeNull();
  expect(document.querySelector('main, [role="main"], section')).not.toBeNull();
  expect(document.querySelector('footer')).not.toBeNull();
});
