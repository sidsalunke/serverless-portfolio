'use strict';

function initPortfolio() {

  /* ── Fonts: activate preloaded Google Fonts stylesheet ──
     The <link id="google-fonts"> in <head> uses rel="preload" to start the
     download without blocking render.  CSP script-src 'self' forbids inline
     event handlers, so we activate the font here instead of via onload="...". */
  var fontsEl = document.getElementById('google-fonts');
  if (fontsEl) { fontsEl.rel = 'stylesheet'; }

  /* ── Footer: current year ── */
  var yearEl = document.getElementById('footer-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ── Nav: scroll glassmorphism ── */
  var nav = document.getElementById('main-nav');
  if (nav) {
    window.addEventListener('scroll', function () {
      nav.classList.toggle('nav--scrolled', window.scrollY > 30);
    }, { passive: true });
  }

  /* ── Nav: hamburger / mobile drawer ── */
  var hamburger = document.getElementById('nav-hamburger');
  var navLinks  = document.getElementById('nav-links');
  var backdrop  = null;

  function openMenu() {
    hamburger.classList.add('nav__hamburger--open');
    navLinks.classList.add('nav__links--open');
    hamburger.setAttribute('aria-expanded', 'true');
    backdrop = document.createElement('div');
    backdrop.className = 'nav__backdrop';
    backdrop.setAttribute('aria-hidden', 'true');
    backdrop.addEventListener('click', closeMenu);
    document.body.appendChild(backdrop);
  }

  function closeMenu() {
    hamburger.classList.remove('nav__hamburger--open');
    navLinks.classList.remove('nav__links--open');
    hamburger.setAttribute('aria-expanded', 'false');
    if (backdrop) { backdrop.remove(); backdrop = null; }
  }

  if (hamburger && navLinks) {
    hamburger.addEventListener('click', function () {
      navLinks.classList.contains('nav__links--open') ? closeMenu() : openMenu();
    });

    navLinks.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', closeMenu);
    });
  }

  /* ── Experience: accordion ── */
  document.querySelectorAll('.exp__card--expandable').forEach(function (card) {
    var header  = card.querySelector('.exp__header');
    var details = card.querySelector('.exp__details');
    var chevron = card.querySelector('.exp__chevron');

    function toggle() {
      var wasExpanded = card.classList.contains('exp__card--expanded');

      document.querySelectorAll('.exp__card--expanded').forEach(function (c) {
        c.classList.remove('exp__card--expanded');
        c.querySelector('.exp__details').classList.remove('exp__details--open');
        c.querySelector('.exp__chevron').classList.remove('exp__chevron--open');
        c.querySelector('.exp__header').setAttribute('aria-expanded', 'false');
      });

      if (!wasExpanded) {
        card.classList.add('exp__card--expanded');
        details.classList.add('exp__details--open');
        chevron.classList.add('exp__chevron--open');
        header.setAttribute('aria-expanded', 'true');
      }
    }

    if (header) {
      header.addEventListener('click', toggle);
      header.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
      });
    }
  });
}

// Browser: auto-init (no module system)
// Jest/Node: export for tests to call manually
if (typeof module === 'undefined') {
  initPortfolio();
} else {
  module.exports = { initPortfolio };
}
