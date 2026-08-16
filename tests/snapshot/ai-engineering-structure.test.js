'use strict';

/**
 * Snapshot tests for ai-engineering.html — catch unintended markup regressions.
 * Mirrors tests/snapshot/structure.test.js's approach for index.html.
 *
 * Run `jest --updateSnapshot` (or `jest -u`) intentionally after
 * a deliberate markup change to update the baseline.
 */

const fs   = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, '../../ai-engineering.html'), 'utf8');

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

test('workflow job cards match snapshot', () => {
  expect(document.querySelector('.tq-job__cards').innerHTML).toMatchSnapshot();
});

test('footer matches snapshot', () => {
  expect(document.querySelector('footer').innerHTML).toMatchSnapshot();
});

test('number of deploy cards stays at 4', () => {
  expect(document.querySelectorAll('.tq-deploy-card').length).toBe(4);
});
