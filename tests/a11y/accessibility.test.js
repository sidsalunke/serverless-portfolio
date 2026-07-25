'use strict';

/**
 * Accessibility tests using jest-axe.
 * Loads the real HTML files and runs axe-core WCAG 2.1 AA checks.
 */

const fs   = require('fs');
const path = require('path');
const { axe, toHaveNoViolations } = require('jest-axe');

expect.extend(toHaveNoViolations);

const html        = fs.readFileSync(path.join(__dirname, '../../index.html'),   'utf8');
const testingHtml = fs.readFileSync(path.join(__dirname, '../../testing.html'), 'utf8');

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

// ── testing.html ────────────────────────────────────────────────

test('testing.html has no WCAG 2.1 AA accessibility violations', async () => {
  const results = await axe(testingHtml, {
    runOnly: {
      type: 'tag',
      values: ['wcag2a', 'wcag2aa'],
    },
  });
  expect(results).toHaveNoViolations();
}, 15_000);

test('testing.html has a single h1', () => {
  document.documentElement.innerHTML = testingHtml;
  expect(document.querySelectorAll('h1').length).toBe(1);
});

test('testing.html pipeline nodes are keyboard-reachable', () => {
  document.documentElement.innerHTML = testingHtml;
  const nodes = document.querySelectorAll('.tq-pipeline__node--clickable');
  expect(nodes.length).toBeGreaterThan(0);
  nodes.forEach(node => {
    expect(node.getAttribute('tabindex')).toBe('0');
    expect(node.getAttribute('role')).toBe('button');
  });
});

test('testing.html all panels are hidden on load', () => {
  document.documentElement.innerHTML = testingHtml;
  const panels = document.querySelectorAll('.tq-panel');
  panels.forEach(panel => {
    expect(panel.hidden).toBe(true);
  });
});
