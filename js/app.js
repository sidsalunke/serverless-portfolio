'use strict';

function initPortfolio() {

  /* ── iOS/WebKit: enable :active and :hover on tap ──
     WebKit (Safari, and every iOS browser incl. Chrome — Apple mandates
     WebKit under the hood there) only applies :active/:hover on touch if a
     touchstart listener exists somewhere on the page. Without this, tap
     feedback (hamburger, nav links, logo) silently never fires on iOS. */
  document.body.addEventListener('touchstart', function () {}, { passive: true });

  /* ── Fonts: activate preloaded Google Fonts stylesheet ──
     The <link id="google-fonts"> in <head> uses rel="preload" to start the
     download without blocking render.  CSP script-src 'self' forbids inline
     event handlers, so we activate the font here instead of via onload="...". */
  var fontsEl = document.getElementById('google-fonts');
  if (fontsEl) { fontsEl.rel = 'stylesheet'; }

  /* ── Footer: current year ── */
  var yearEl = document.getElementById('footer-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ── Nav: scroll glassmorphism ──
     Checked once on load too, not just on 'scroll' — a user landing mid-page
     (e.g. an index.html#experience link from another page) never fires a
     scroll event, so without this the sticky state (and on mobile, the
     hamburger it gates — see .nav--scrolled .nav__hamburger in main.css)
     would stay stuck off even though they're well past the 30px threshold. */
  var nav = document.getElementById('main-nav');
  if (nav) {
    function updateNavScrolled() {
      nav.classList.toggle('nav--scrolled', window.scrollY > 30);
    }
    updateNavScrolled();
    window.addEventListener('scroll', updateNavScrolled, { passive: true });
  }

  /* ── Nav: hamburger / mobile drawer ──
     On mobile this button only ever becomes visible once .nav--scrolled is
     active (see main.css) — never on initial load. That sidesteps a real
     WebKit-specific bug we chased through two fixes (requestAnimationFrame
     polling, then MutationObserver) without resolving: on physical iOS
     Safari/Chrome (both forced onto WebKit), tap responsiveness stayed
     broken for several seconds right after a cold load, reliably, despite
     both fixes working under every DevTools throttling test. It was always
     smooth once scrolled, so the button simply isn't shown before then —
     by which point this normal (non-inline, CSS-blocking-gated) binding
     has long since run. */
  var hamburger = document.getElementById('nav-hamburger');
  var navLinks  = document.getElementById('nav-links');
  if (hamburger && navLinks) {
    var backdrop = null;

    var openMenu = function () {
      hamburger.classList.add('nav__hamburger--open');
      navLinks.classList.add('nav__links--open');
      hamburger.setAttribute('aria-expanded', 'true');
      backdrop = document.createElement('div');
      backdrop.className = 'nav__backdrop';
      backdrop.setAttribute('aria-hidden', 'true');
      backdrop.setAttribute('data-testid', 'nav-backdrop');
      backdrop.addEventListener('click', closeMenu);
      document.body.appendChild(backdrop);
    };

    var closeMenu = function () {
      hamburger.classList.remove('nav__hamburger--open');
      navLinks.classList.remove('nav__links--open');
      hamburger.setAttribute('aria-expanded', 'false');
      if (backdrop) { backdrop.remove(); backdrop = null; }
    };

    hamburger.addEventListener('click', function () {
      navLinks.classList.contains('nav__links--open') ? closeMenu() : openMenu();
    });

    navLinks.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', closeMenu);
    });
  }

  /* ── Pipeline: interactive nodes (testing.html) ── */
  var pipelineNodes = document.querySelectorAll('.tq-pipeline__node--clickable');
  if (pipelineNodes.length) {
    pipelineNodes.forEach(function (node) {
      function togglePanel() {
        var panelId = node.getAttribute('data-panel');
        var panel   = document.getElementById(panelId);
        if (!panel) return;
        var isOpen = !panel.hidden;

        // collapse all panels and reset all nodes
        document.querySelectorAll('.tq-panel').forEach(function (p) { p.hidden = true; });
        pipelineNodes.forEach(function (n) { n.setAttribute('aria-expanded', 'false'); });

        if (!isOpen) {
          panel.hidden = false;
          node.setAttribute('aria-expanded', 'true');
          if (panel.scrollIntoView) { panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }
        }
      }
      // node is a real <button> now, so Enter/Space activation comes from
      // the browser for free — just listen for 'click'.
      node.addEventListener('click', togglePanel);
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

    // header is a real <button> now, so Enter/Space activation and focus
    // styling come from the browser for free — just listen for 'click'.
    if (header) {
      header.addEventListener('click', toggle);
    }
  });

  /* ── Scroll-reveal entrance motion ──
     Progressive enhancement only: elements just render normally without
     IntersectionObserver support, and reduced-motion users get the final
     state immediately rather than a suppressed/broken animation. */
  var revealEls = document.querySelectorAll(
    '.section__heading, .about__photo-wrap, .about__body, .exp__card, .skills__group'
  );
  var prefersReducedMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (revealEls.length && 'IntersectionObserver' in window && !prefersReducedMotion) {
    revealEls.forEach(function (el) { el.classList.add('reveal'); });

    var revealObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal--in');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach(function (el) { revealObserver.observe(el); });
  }

  /* ── Card spotlight hover ──
     Cursor-tracked glow on experience/skills cards. Desktop-only: gated
     behind (hover: hover) and (pointer: fine) so touch devices skip the
     listeners entirely (no benefit there, and avoids sticky-hover states). */
  var canHover = window.matchMedia &&
    window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  if (canHover) {
    document.querySelectorAll('.exp__card, .skills__group').forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var rect = card.getBoundingClientRect();
        card.style.setProperty('--spot-x', ((e.clientX - rect.left) / rect.width * 100) + '%');
        card.style.setProperty('--spot-y', ((e.clientY - rect.top) / rect.height * 100) + '%');
      });
    });
  }
}

// Browser: auto-init (no module system)
// Jest/Node: export for tests to call manually
/* istanbul ignore next */
if (typeof module === 'undefined') {
  initPortfolio();
} else {
  module.exports = { initPortfolio };
}
