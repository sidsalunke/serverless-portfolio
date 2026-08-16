'use strict';

/**
 * Snapshot tests for testing.html — catch unintended markup regressions.
 * Mirrors tests/snapshot/structure.test.js's approach for index.html.
 *
 * Run `jest --updateSnapshot` (or `jest -u`) intentionally after
 * a deliberate markup change to update the baseline.
 */

const fs   = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, '../../testing.html'), 'utf8');

beforeAll(() => {
  document.documentElement.innerHTML = html;
});

test('navigation links match snapshot', () => {
  const nav = document.querySelector('nav');
  expect(nav.innerHTML).toMatchSnapshot();
});

test('hero stats match snapshot', () => {
  expect(document.querySelector('.tq-hero__stats').innerHTML).toMatchSnapshot();
});

test('pipeline matches snapshot', () => {
  expect(document.querySelector('.tq-pipeline').innerHTML).toMatchSnapshot();
});

test('footer matches snapshot', () => {
  expect(document.querySelector('footer').innerHTML).toMatchSnapshot();
});

test('number of pipeline nodes stays at 5', () => {
  expect(document.querySelectorAll('.tq-pipeline__node').length).toBe(5);
});

test('number of detail panels stays at 3', () => {
  expect(document.querySelectorAll('.tq-panel').length).toBe(3);
});
