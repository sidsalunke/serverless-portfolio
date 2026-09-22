'use strict';

function initPortfolio() {

  /* ── iOS/WebKit: enable :active and :hover on tap ──
     WebKit (Safari, and every iOS browser incl. Chrome — Apple mandates
     WebKit under the hood there) only applies :active/:hover on touch if a
     touchstart listener exists somewhere on the page. Without this, tap
     feedback (hamburger, nav links, logo) silently never fires on iOS. */
  document.body.addEventListener('touchstart', function () {}, { passive: true });

  /* ── Footer: current year ── */
  var yearEl = document.getElementById('footer-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ── Nav: scroll glassmorphism ──
     Checked once on load too, not just on 'scroll' — a user landing mid-page
     (e.g. an index.html#experience link from another page) never fires a
     scroll event, so without this the sticky state (and on mobile, the
     hamburger it gates — see .nav--scrolled .nav__hamburger in main.css)
     would stay stuck off even though they're well past the 30px threshold.
     The initial check runs via requestAnimationFrame, not synchronously —
     reading window.scrollY right here would force a synchronous layout in
     the middle of the rest of this function's DOM writes (confirmed via a
     Lighthouse "forced reflow" trace pointing at this exact line, ~117ms).
     rAF defers the read to just before the browser's own next paint, so it
     doesn't fight the layout the rest of initPortfolio is still producing. */
  var nav = document.getElementById('main-nav');
  if (nav) {
    function updateNavScrolled() {
      nav.classList.toggle('nav--scrolled', window.scrollY > 30);
    }
    requestAnimationFrame(updateNavScrolled);
    window.addEventListener('scroll', updateNavScrolled, { passive: true });
  }

  /* ── Theme: light/dark toggle ──
     The theme-init inline <script> in <head> already applied a stored
     "dark" preference (if any) to <html> before this script even loads, so
     there's no flash to fix here — this just wires up the toggle button and
     keeps localStorage in sync going forward. */
  var themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    var root = document.documentElement;

    var syncThemeToggleLabel = function () {
      var isDark = root.getAttribute('data-theme') === 'dark';
      themeToggle.setAttribute('aria-pressed', String(isDark));
      themeToggle.setAttribute('aria-label', isDark ? 'Switch to light theme' : 'Switch to dark theme');
    };
    syncThemeToggleLabel();

    themeToggle.addEventListener('click', function () {
      var isDark = root.getAttribute('data-theme') === 'dark';
      if (isDark) {
        root.removeAttribute('data-theme');
      } else {
        root.setAttribute('data-theme', 'dark');
      }
      syncThemeToggleLabel();
      try { localStorage.setItem('theme', isDark ? 'light' : 'dark'); } catch (e) {}
    });
  }

  /* ── Nav: hamburger / mobile drawer ──
     Bound here in the normal app.js load path — no special early-binding
     trick needed. This button used to be hidden on mobile until scrolled
     (see main.css git history), a workaround for tap responsiveness
     breaking on real iOS Safari/Chrome for several seconds after a cold
     load, which two earlier JS-scheduling fixes (requestAnimationFrame
     polling, then MutationObserver) didn't resolve. The actual cause was
     .hero__orb's blur(90px) layers competing for GPU compositing time on
     first paint — see main.css's mobile media query — not anything about
     when this listener binds. With that fixed, the button is visible (and
     should be responsive) immediately again. */
  var hamburger = document.getElementById('nav-hamburger');
  var navLinks  = document.getElementById('nav-links');
  if (hamburger && navLinks) {
    var backdrop = null;

    var openMenu = function () {
      hamburger.classList.add('nav__hamburger--open');
      navLinks.classList.add('nav__links--open');
      hamburger.setAttribute('aria-expanded', 'true');
      if (nav) nav.classList.add('nav--menu-open');
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
      if (nav) nav.classList.remove('nav--menu-open');
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
     state immediately rather than a suppressed/broken animation.

     Two things fixed here after real-device reports of a visible flash on
     load and blank sections during fast scrolling:

     1. An element already on screen when this code runs (e.g. .about__body
        if the user loaded mid-page, or on a short viewport where more than
        one section fits) used to still get the hidden .reveal class added,
        snapping it invisible for an instant before the observer fired and
        faded it back in — pure regression with no animation benefit, since
        it was already visible. Now checked against the viewport first and
        left alone (rendered normally, no animate-in) if already in view.
     2. rootMargin's bottom value was negative (0px 0px -40px 0px), which
        shrinks the trigger area — the reveal only started once an element
        was already meaningfully on screen. On a fast flick-scroll the 0.6s
        fade couldn't keep up, so a section could scroll into view still at
        opacity: 0, reading as a blank/black gap. A positive bottom margin
        starts the fade before the element is actually visible, so by the
        time it scrolls into view it's already fading in or done. */
  var revealEls = document.querySelectorAll(
    '.section__heading, .about__photo-wrap, .about__body, .exp__card, .skills__group'
  );
  var prefersReducedMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (revealEls.length && 'IntersectionObserver' in window && !prefersReducedMotion) {
    var revealObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal--in');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px 200px 0px' });

    // Read all layout rects first, then apply classes/observers in a second
    // pass — interleaving getBoundingClientRect() reads with classList
    // writes forces a synchronous layout recalc on every iteration
    // (Lighthouse "forced reflow"); batching reads/writes avoids that.
    var offscreenEls = [];
    revealEls.forEach(function (el) {
      var rect = el.getBoundingClientRect();
      if (!(rect.top < window.innerHeight && rect.bottom > 0)) {
        offscreenEls.push(el); // not yet visible — animate it in
      }
    });
    offscreenEls.forEach(function (el) {
      el.classList.add('reveal');
      revealObserver.observe(el);
    });
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
