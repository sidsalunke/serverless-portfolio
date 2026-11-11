'use strict';

/**
 * Unit tests for the CloudFront viewer-request function that implements
 * clean URLs (infra/functions/clean-urls.js).
 *
 * The file is written for the CloudFront Functions runtime, which has no
 * module system, so it is loaded as text and evaluated to get `handler`.
 * These tests are the only check on this code before it reaches the edge:
 * CI does not deploy it, and the local dev server (`serve`) uses its own
 * cleanUrls implementation instead.
 */

const fs   = require('fs');
const path = require('path');

const code = fs.readFileSync(path.join(__dirname, '../../infra/functions/clean-urls.js'), 'utf8');
// eslint-disable-next-line no-new-func
const handler = new Function(`${code}; return handler;`)();

function run(uri, querystring = {}) {
  return handler({ request: { uri, querystring, headers: {} } });
}

const rewrittenTo = (uri) => run(uri).uri;
const redirectOf  = (uri, qs) => {
  const res = run(uri, qs);
  return res.statusCode === 301 ? res.headers.location.value : null;
};

describe('rewrites clean URLs to .html objects', () => {
  test.each([
    ['/testing', '/testing.html'],
    ['/ai-engineering', '/ai-engineering.html'],
    ['/writing', '/writing.html'],
    ['/writing/rollback-static-site-s3-cloudfront', '/writing/rollback-static-site-s3-cloudfront.html'],
    ['/a-page-added-later', '/a-page-added-later.html'],
  ])('%s → %s', (uri, expected) => {
    expect(rewrittenTo(uri)).toBe(expected);
  });
});

describe('leaves non-page requests untouched', () => {
  test.each([
    '/',
    '/404.html',
    '/404',
    '/styles/main.css',
    '/js/app.js',
    '/fonts/outfit-variable.woff2',
    '/images/logos/emirates.svg',
    '/robots.txt',
    '/sitemap_index.xml',
    '/llms.txt',
    '/favicon.svg',
  ])('%s', (uri) => {
    const res = run(uri);
    expect(res.statusCode).toBeUndefined();
    expect(res.uri).toBe(uri);
  });
});

describe('301-redirects duplicate URL forms to the clean URL', () => {
  test.each([
    ['/index.html', '/'],
    ['/testing.html', '/testing'],
    ['/ai-engineering.html', '/ai-engineering'],
    ['/writing.html', '/writing'],
    ['/writing/', '/writing'],
    ['/writing/index.html', '/writing'],
    ['/writing/rollback-static-site-s3-cloudfront.html', '/writing/rollback-static-site-s3-cloudfront'],
    ['/testing/', '/testing'],
  ])('%s → %s', (uri, expected) => {
    expect(redirectOf(uri)).toBe(expected);
  });

  test('keeps the query string', () => {
    expect(redirectOf('/testing.html', { utm_source: { value: 'linkedin' }, q: { value: 'a b' } }))
      .toBe('/testing?utm_source=linkedin&q=a%20b');
  });

  test('a redirect target is never itself redirected (no loops)', () => {
    for (const uri of ['/index.html', '/testing.html', '/writing/', '/writing/index.html']) {
      expect(redirectOf(redirectOf(uri))).toBeNull();
    }
  });
});

describe('never redirects off-site', () => {
  // "Location: //host" is protocol-relative: the browser leaves the site.
  test.each([
    '//evil.example/',
    '//evil.example/index.html',
    '//evil.example/page.html',
    '///evil.example/',
    '/\\evil.example/',
    '/foo//bar/',
    '/%2F%2Fevil.example/',
    '//',
  ])('%s is not redirected', (uri) => {
    expect(redirectOf(uri)).toBeNull();
  });
});
