'use strict';

/**
 * Unit tests for js/theme-init.js, the synchronous script in <head> that
 * picks the theme before first paint.
 *
 * Rule under test: a stored choice always wins; with nothing stored, the
 * operating system preference (prefers-color-scheme) decides.
 */

const fs   = require('fs');
const path = require('path');

const root = path.join(__dirname, '../..');

function run({ stored, systemDark, storageThrows = false, noMatchMedia = false }) {
  document.documentElement.removeAttribute('data-theme');
  localStorage.clear();
  if (stored) localStorage.setItem('theme', stored);

  if (noMatchMedia) {
    delete window.matchMedia;
  } else {
    window.matchMedia = jest.fn().mockReturnValue({ matches: !!systemDark });
  }

  const spy = storageThrows
    ? jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('blocked'); })
    : null;

  jest.resetModules();
  require('../../js/theme-init.js');
  if (spy) spy.mockRestore();

  return document.documentElement.getAttribute('data-theme');
}

describe('theme-init.js', () => {
  test('nothing stored, system light: light', () => {
    expect(run({ systemDark: false })).toBeNull();
  });

  test('nothing stored, system dark: dark', () => {
    expect(run({ systemDark: true })).toBe('dark');
  });

  test('stored dark wins over a light system', () => {
    expect(run({ stored: 'dark', systemDark: false })).toBe('dark');
  });

  test('stored light wins over a dark system', () => {
    expect(run({ stored: 'light', systemDark: true })).toBeNull();
  });

  test('asks the browser about prefers-color-scheme: dark', () => {
    run({ systemDark: true });
    expect(window.matchMedia).toHaveBeenCalledWith('(prefers-color-scheme: dark)');
  });

  test('blocked localStorage falls back to the system preference', () => {
    expect(run({ systemDark: true, storageThrows: true })).toBe('dark');
    expect(run({ systemDark: false, storageThrows: true })).toBeNull();
  });

  test('a browser without matchMedia stays light unless dark is stored', () => {
    expect(run({ noMatchMedia: true })).toBeNull();
    expect(run({ stored: 'dark', noMatchMedia: true })).toBe('dark');
  });
});

/**
 * Wiring: every page must load the script synchronously in <head>, before
 * the stylesheet, and carry no inline script. An inline script would need a
 * CSP hash again, coupling page content to infra/main.tf.
 */
describe('theme-init wiring', () => {
  const pages = [
    ...fs.readdirSync(root).filter((f) => f.endsWith('.html')),
    ...fs.readdirSync(path.join(root, 'writing')).filter((f) => f.endsWith('.html')).map((f) => `writing/${f}`),
  ];

  test.each(pages)('%s loads /js/theme-init.js synchronously before the stylesheet', (file) => {
    const html = fs.readFileSync(path.join(root, file), 'utf8');
    const doc  = new DOMParser().parseFromString(html, 'text/html');

    const script = doc.head.querySelector('script[src="/js/theme-init.js"]');
    expect(script).not.toBeNull();
    expect(script.hasAttribute('defer')).toBe(false);
    expect(script.hasAttribute('async')).toBe(false);

    const sheet = doc.head.querySelector('link[rel="stylesheet"]');
    expect(script.compareDocumentPosition(sheet) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  test.each(pages)('%s has no inline executable script and no CSP script hash', (file) => {
    const html = fs.readFileSync(path.join(root, file), 'utf8');
    const doc  = new DOMParser().parseFromString(html, 'text/html');

    const inline = [...doc.querySelectorAll('script:not([src])')]
      .filter((s) => s.getAttribute('type') !== 'application/ld+json');
    expect(inline).toEqual([]);

    const csp = doc.querySelector('meta[http-equiv="Content-Security-Policy"]').getAttribute('content');
    expect(csp).toMatch(/script-src 'self';/);
    expect(csp).not.toMatch(/sha256-|unsafe-inline'?;\s*style-src|script-src[^;]*unsafe/);
  });

  test('deploy and rollback upload every file in js/', () => {
    const workflow = fs.readFileSync(path.join(root, '.github/workflows/deploy.yml'), 'utf8');
    expect(workflow.match(/--include "js\/\*"/g).length).toBe(2);
    expect(workflow).not.toMatch(/--include "js\/app\.js"/);
  });
});
