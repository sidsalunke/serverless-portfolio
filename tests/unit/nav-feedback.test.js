'use strict';

/**
 * Static regression check for mobile nav tap feedback.
 *
 * Playwright's synthetic mouse events don't reliably surface Chromium's
 * :active pseudo-class through getComputedStyle() in this environment (see
 * PR history), so instead of a flaky browser-driven interaction test, this
 * asserts the CSS rules that provide the pressed-state feedback are present.
 */

const fs   = require('fs');
const path = require('path');

const css = fs.readFileSync(path.join(__dirname, '../../styles/main.css'), 'utf8');

describe('Mobile nav tap feedback CSS', () => {
  test('hamburger has a pressed (:active) state', () => {
    expect(css).toMatch(/\.nav__hamburger:active\s*{[^}]*}/);
  });

  test('hamburger spans change color when pressed', () => {
    expect(css).toMatch(/\.nav__hamburger:active span\s*{[^}]*background:\s*var\(--accent\)/);
  });

  test('nav links have a pressed (:active) state', () => {
    expect(css).toMatch(/\.nav__link:active\s*{[^}]*color:\s*var\(--accent\)/);
  });
});
