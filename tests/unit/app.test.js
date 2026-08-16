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

// ── Pipeline panel toggle (testing.html) ──────────────────────
const PIPELINE_DOM = `
  <span id="footer-year"></span>
  <nav id="main-nav" class="nav"></nav>
  <button id="nav-hamburger" aria-expanded="false"><span></span><span></span><span></span></button>
  <ul id="nav-links" class="nav__links"></ul>
  <div class="tq-pipeline__node tq-pipeline__node--clickable"
       role="button" tabindex="0" aria-expanded="false" data-panel="panel-pr-checks">
    <span class="tq-pipeline__node-label">PR Checks</span>
  </div>
  <div class="tq-pipeline__node tq-pipeline__node--clickable"
       role="button" tabindex="0" aria-expanded="false" data-panel="panel-deploy">
    <span class="tq-pipeline__node-label">Deploy</span>
  </div>
  <div class="tq-pipeline__node tq-pipeline__node--clickable"
       role="button" tabindex="0" aria-expanded="false" data-panel="panel-live-verify">
    <span class="tq-pipeline__node-label">Live Verify</span>
  </div>
  <div id="panel-pr-checks"   class="tq-panel" hidden></div>
  <div id="panel-deploy"      class="tq-panel" hidden></div>
  <div id="panel-live-verify" class="tq-panel" hidden></div>
`;

describe('Pipeline panel toggle', () => {
  beforeEach(() => {
    document.body.innerHTML = PIPELINE_DOM;
    initPortfolio();
  });

  test('clicking a node reveals its panel', () => {
    document.querySelectorAll('.tq-pipeline__node--clickable')[0].click();
    expect(document.getElementById('panel-pr-checks').hidden).toBe(false);
  });

  test('clicking the same node again hides the panel', () => {
    const node = document.querySelectorAll('.tq-pipeline__node--clickable')[0];
    node.click();
    node.click();
    expect(document.getElementById('panel-pr-checks').hidden).toBe(true);
  });

  test('clicking a node sets aria-expanded="true"', () => {
    const node = document.querySelectorAll('.tq-pipeline__node--clickable')[0];
    node.click();
    expect(node.getAttribute('aria-expanded')).toBe('true');
  });

  test('clicking same node resets aria-expanded to "false"', () => {
    const node = document.querySelectorAll('.tq-pipeline__node--clickable')[0];
    node.click();
    node.click();
    expect(node.getAttribute('aria-expanded')).toBe('false');
  });

  test('clicking a different node closes the first panel and opens the second', () => {
    const [node0, node1] = document.querySelectorAll('.tq-pipeline__node--clickable');
    node0.click();
    node1.click();
    expect(document.getElementById('panel-pr-checks').hidden).toBe(true);
    expect(document.getElementById('panel-deploy').hidden).toBe(false);
    expect(node0.getAttribute('aria-expanded')).toBe('false');
    expect(node1.getAttribute('aria-expanded')).toBe('true');
  });

  test('only one panel is open at a time', () => {
    document.querySelectorAll('.tq-pipeline__node--clickable').forEach(n => n.click());
    const openPanels = document.querySelectorAll('.tq-panel:not([hidden])');
    expect(openPanels.length).toBe(1);
  });

  test('Enter key opens a panel', () => {
    const node = document.querySelectorAll('.tq-pipeline__node--clickable')[0];
    node.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    expect(document.getElementById('panel-pr-checks').hidden).toBe(false);
  });

  test('Space key opens a panel', () => {
    const node = document.querySelectorAll('.tq-pipeline__node--clickable')[0];
    node.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
    expect(document.getElementById('panel-pr-checks').hidden).toBe(false);
  });

  test('other keys do not open a panel', () => {
    const node = document.querySelectorAll('.tq-pipeline__node--clickable')[0];
    node.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
    expect(document.getElementById('panel-pr-checks').hidden).toBe(true);
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

// ── Scroll-reveal entrance motion ──────────────────────────────
const REVEAL_DOM = `
  <span id="footer-year"></span>
  <nav id="main-nav" class="nav"></nav>
  <button id="nav-hamburger" aria-expanded="false"><span></span><span></span><span></span></button>
  <ul id="nav-links" class="nav__links"></ul>
  <h2 class="section__heading">About</h2>
  <div class="about__photo-wrap"></div>
  <article class="exp__card"></article>
  <div class="skills__group"></div>
`;

function mockMatchMedia(matchingQueries) {
  window.matchMedia = jest.fn().mockImplementation((query) => ({
    matches: matchingQueries.indexOf(query) !== -1,
    media: query,
    addListener: jest.fn(),
    removeListener: jest.fn(),
  }));
}

class MockIntersectionObserver {
  constructor(callback, options) {
    this.callback = callback;
    this.options = options;
    this.observed = [];
    MockIntersectionObserver.lastInstance = this;
  }
  observe(el) { this.observed.push(el); }
  unobserve(el) { this.observed = this.observed.filter((o) => o !== el); }
  disconnect() { this.observed = []; }
}

describe('Scroll-reveal entrance motion', () => {
  afterEach(() => {
    delete window.IntersectionObserver;
  });

  test('observes reveal-eligible elements when IntersectionObserver is available and motion is allowed', () => {
    window.IntersectionObserver = MockIntersectionObserver;
    mockMatchMedia([]); // prefers-reduced-motion: reduce -> not matched
    document.body.innerHTML = REVEAL_DOM;
    jest.resetModules();
    ({ initPortfolio } = require('../../js/app.js'));
    initPortfolio();

    const revealEls = document.querySelectorAll('.reveal');
    expect(revealEls.length).toBe(4);
    expect(MockIntersectionObserver.lastInstance.observed.length).toBe(4);
  });

  test('adds reveal--in and stops observing once an element intersects', () => {
    window.IntersectionObserver = MockIntersectionObserver;
    mockMatchMedia([]);
    document.body.innerHTML = REVEAL_DOM;
    jest.resetModules();
    ({ initPortfolio } = require('../../js/app.js'));
    initPortfolio();

    const heading = document.querySelector('.section__heading');
    const observer = MockIntersectionObserver.lastInstance;
    observer.callback([{ target: heading, isIntersecting: true }], observer);

    expect(heading.classList).toContain('reveal--in');
    expect(observer.observed).not.toContain(heading);
  });

  test('ignores non-intersecting entries', () => {
    window.IntersectionObserver = MockIntersectionObserver;
    mockMatchMedia([]);
    document.body.innerHTML = REVEAL_DOM;
    jest.resetModules();
    ({ initPortfolio } = require('../../js/app.js'));
    initPortfolio();

    const heading = document.querySelector('.section__heading');
    const observer = MockIntersectionObserver.lastInstance;
    observer.callback([{ target: heading, isIntersecting: false }], observer);

    expect(heading.classList).not.toContain('reveal--in');
  });

  test('skips reveal entirely when the user prefers reduced motion', () => {
    window.IntersectionObserver = MockIntersectionObserver;
    mockMatchMedia(['(prefers-reduced-motion: reduce)']);
    document.body.innerHTML = REVEAL_DOM;
    jest.resetModules();
    ({ initPortfolio } = require('../../js/app.js'));
    initPortfolio();

    expect(document.querySelectorAll('.reveal').length).toBe(0);
  });

  test('skips reveal when IntersectionObserver is unavailable', () => {
    delete window.IntersectionObserver;
    mockMatchMedia([]);
    document.body.innerHTML = REVEAL_DOM;
    jest.resetModules();
    ({ initPortfolio } = require('../../js/app.js'));
    initPortfolio();

    expect(document.querySelectorAll('.reveal').length).toBe(0);
  });
});

// ── Card spotlight hover ────────────────────────────────────────
describe('Card spotlight hover', () => {
  test('updates --spot-x/--spot-y custom properties on mousemove when the device supports hover', () => {
    mockMatchMedia(['(hover: hover) and (pointer: fine)']);
    document.body.innerHTML = REVEAL_DOM;
    jest.resetModules();
    ({ initPortfolio } = require('../../js/app.js'));
    initPortfolio();

    const card = document.querySelector('.exp__card');
    card.getBoundingClientRect = () => ({ left: 0, top: 0, width: 200, height: 100 });
    card.dispatchEvent(new MouseEvent('mousemove', { clientX: 50, clientY: 25, bubbles: true }));

    expect(card.style.getPropertyValue('--spot-x')).toBe('25%');
    expect(card.style.getPropertyValue('--spot-y')).toBe('25%');
  });

  test('does not attach the spotlight listener on touch-only devices', () => {
    mockMatchMedia([]); // (hover: hover) and (pointer: fine) -> not matched
    document.body.innerHTML = REVEAL_DOM;
    jest.resetModules();
    ({ initPortfolio } = require('../../js/app.js'));
    initPortfolio();

    const card = document.querySelector('.exp__card');
    card.getBoundingClientRect = () => ({ left: 0, top: 0, width: 200, height: 100 });
    card.dispatchEvent(new MouseEvent('mousemove', { clientX: 50, clientY: 25, bubbles: true }));

    expect(card.style.getPropertyValue('--spot-x')).toBe('');
  });
});
