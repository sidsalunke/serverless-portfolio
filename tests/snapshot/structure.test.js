'use strict';

/**
 * Snapshot tests — catch unintended markup regressions.
 *
 * Run `jest --updateSnapshot` (or `jest -u`) intentionally after
 * a deliberate markup change to update the baseline.
 */

const fs   = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, '../../index.html'), 'utf8');

beforeAll(() => {
  document.documentElement.innerHTML = html;
});

test('navigation links match snapshot', () => {
  const nav = document.querySelector('nav');
  expect(nav.innerHTML).toMatchSnapshot();
});

test('hero section matches snapshot', () => {
  expect(document.querySelector('.hero__content').innerHTML).toMatchSnapshot();
});

test('experience list matches snapshot', () => {
  expect(document.querySelector('.exp__list').innerHTML).toMatchSnapshot();
});

test('skills grid matches snapshot', () => {
  expect(document.querySelector('.skills__grid').innerHTML).toMatchSnapshot();
});

test('footer matches snapshot', () => {
  expect(document.querySelector('footer').innerHTML).toMatchSnapshot();
});

test('number of experience cards stays at 6', () => {
  expect(document.querySelectorAll('.exp__card').length).toBe(6);
});

test('number of skill groups stays at 6', () => {
  expect(document.querySelectorAll('.skills__group').length).toBe(6);
});

test('Emirates card has no expandable chevron', () => {
  const emiratesCard = document.querySelector('[aria-label="Principal Quality Engineer at Emirates Group"]');
  expect(emiratesCard.querySelectorAll('.exp__chevron').length).toBe(0);
});
