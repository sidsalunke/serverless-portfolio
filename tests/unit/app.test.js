'use strict';

/**
 * Unit tests for js/app.js
 * Sets up a minimal DOM matching the real HTML structure, then calls
 * initPortfolio() and asserts JS behaviour without a browser.
 */

const MINIMAL_DOM = `
  <span id="footer-year"></span>
  <nav id="main-nav" class="nav"></nav>
  <button id="nav-hamburger" class="nav__hamburger" aria-expanded="false">
    <span></span><span></span><span></span>
  </button>
  <ul id="nav-links" class="nav__links">
    <li><a href="#about" class="nav__link">About</a></li>
    <li><a href="#skills" class="nav__link">Skills</a></li>
  </ul>
  <article class="exp__card exp__card--expandable">
    <div class="exp__header" role="button" tabindex="0" aria-expanded="false">
      <div class="exp__header-right">
        <span class="exp__chevron"></span>
      </div>
    </div>
    <div class="exp__details"></div>
  </article>
  <article class="exp__card exp__card--expandable">
    <div class="exp__header" role="button" tabindex="0" aria-expanded="false">
      <div class="exp__header-right">
        <span class="exp__chevron"></span>
      </div>
    </div>
    <div class="exp__details"></div>
  </article>
`;

let initPortfolio;

beforeEach(() => {
  jest.resetModules();
  document.body.innerHTML = MINIMAL_DOM;
  ({ initPortfolio } = require('../../js/app.js'));
  initPortfolio();
});

// ── Font activation ────────────────────────────────────────────
describe('Font activation', () => {
  test('sets rel="stylesheet" on #google-fonts link when present', () => {
    document.body.innerHTML =
      '<link id="google-fonts" rel="preload">' + document.body.innerHTML;
    jest.resetModules();
    ({ initPortfolio } = require('../../js/app.js'));
    initPortfolio();
    expect(document.getElementById('google-fonts').getAttribute('rel')).toBe('stylesheet');
  });
});

// ── Footer year ────────────────────────────────────────────────
describe('Footer year', () => {
  test('sets #footer-year to the current year', () => {
    expect(document.getElementById('footer-year').textContent)
      .toBe(String(new Date().getFullYear()));
  });
});

// ── Hamburger menu ─────────────────────────────────────────────
describe('Hamburger menu', () => {
  test('opens nav drawer on click', () => {
    document.getElementById('nav-hamburger').click();
    expect(document.getElementById('nav-links').classList).toContain('nav__links--open');
    expect(document.getElementById('nav-hamburger').getAttribute('aria-expanded')).toBe('true');
  });

  test('closes nav drawer on second click', () => {
    const btn = document.getElementById('nav-hamburger');
    btn.click();
    btn.click();
    expect(document.getElementById('nav-links').classList).not.toContain('nav__links--open');
    expect(btn.getAttribute('aria-expanded')).toBe('false');
  });

  test('adds hamburger--open class when open', () => {
    document.getElementById('nav-hamburger').click();
    expect(document.getElementById('nav-hamburger').classList).toContain('nav__hamburger--open');
  });

  test('appends backdrop to body when opened', () => {
    document.getElementById('nav-hamburger').click();
    expect(document.querySelector('.nav__backdrop')).not.toBeNull();
  });

  test('removes backdrop when closed', () => {
    const btn = document.getElementById('nav-hamburger');
    btn.click();
    btn.click();
    expect(document.querySelector('.nav__backdrop')).toBeNull();
  });

  test('closes when a nav link is clicked', () => {
    document.getElementById('nav-hamburger').click();
    document.querySelector('.nav__link').click();
    expect(document.getElementById('nav-links').classList).not.toContain('nav__links--open');
  });
});

// ── Nav scroll ─────────────────────────────────────────────────
describe('Nav scroll behaviour', () => {
  test('adds nav--scrolled class when scrolled past 30px', () => {
    Object.defineProperty(window, 'scrollY', { value: 31, configurable: true });
    window.dispatchEvent(new Event('scroll'));
    expect(document.getElementById('main-nav').classList).toContain('nav--scrolled');
  });

  test('removes nav--scrolled class when back at top', () => {
    Object.defineProperty(window, 'scrollY', { value: 31, configurable: true });
    window.dispatchEvent(new Event('scroll'));
    Object.defineProperty(window, 'scrollY', { value: 0, configurable: true });
    window.dispatchEvent(new Event('scroll'));
    expect(document.getElementById('main-nav').classList).not.toContain('nav--scrolled');
  });
});

// ── Experience accordion ───────────────────────────────────────
describe('Experience accordion', () => {
  test('expands a card on click', () => {
    const cards = document.querySelectorAll('.exp__card--expandable');
    cards[0].querySelector('.exp__header').click();
    expect(cards[0].classList).toContain('exp__card--expanded');
    expect(cards[0].querySelector('.exp__details').classList).toContain('exp__details--open');
    expect(cards[0].querySelector('.exp__chevron').classList).toContain('exp__chevron--open');
    expect(cards[0].querySelector('.exp__header').getAttribute('aria-expanded')).toBe('true');
  });

  test('collapses a card on second click', () => {
    const header = document.querySelectorAll('.exp__header')[0];
    header.click();
    header.click();
    expect(document.querySelectorAll('.exp__card--expanded').length).toBe(0);
  });

  test('only one card is expanded at a time', () => {
    const headers = document.querySelectorAll('.exp__header');
    headers[0].click();
    headers[1].click();
    expect(document.querySelectorAll('.exp__card--expanded').length).toBe(1);
    expect(document.querySelectorAll('.exp__card')[1].classList).toContain('exp__card--expanded');
  });

  test('Enter key expands a card', () => {
    const header = document.querySelector('.exp__header');
    header.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    expect(document.querySelector('.exp__card').classList).toContain('exp__card--expanded');
  });

  test('Space key expands a card', () => {
    const header = document.querySelector('.exp__header');
    header.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
    expect(document.querySelector('.exp__card').classList).toContain('exp__card--expanded');
  });

  test('other keys do not toggle the card', () => {
    const header = document.querySelector('.exp__header');
    header.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
    expect(document.querySelector('.exp__card').classList).not.toContain('exp__card--expanded');
  });
});
