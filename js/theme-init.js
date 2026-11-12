/* Theme init — loaded synchronously in <head>, before the stylesheet paints.

   Decides the theme before first paint so nobody sees a flash of the wrong
   one:
     1. a choice stored by the toggle (localStorage "theme") always wins;
     2. otherwise the operating system preference (prefers-color-scheme).

   Dark is opt-in via data-theme="dark" on <html>; light is the absence of
   the attribute (see styles/main.css). js/app.js wires up the toggle and
   keeps following the system preference while nothing is stored. */
(function () {
  'use strict';

  var stored = null;
  try { stored = localStorage.getItem('theme'); } catch (e) {}

  var systemDark = false;
  try {
    systemDark = !!window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches;
  } catch (e) {}

  if (stored === 'dark' || (stored !== 'light' && systemDark)) {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
})();
