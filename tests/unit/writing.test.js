'use strict';

/**
 * Markup checks for the /writing section: the post index and each article.
 * Parsed from the raw HTML files with jsdom, like tests/unit/seo.test.js.
 */

const fs   = require('fs');
const path = require('path');

const ORIGIN = 'https://portfolio.sidsalunke.info';
const root   = path.join(__dirname, '../..');

const articleFiles = fs.readdirSync(path.join(root, 'writing')).filter((f) => f.endsWith('.html'));

const PAGES = [
  { file: 'writing.html', url: `${ORIGIN}/writing`, type: 'CollectionPage' },
  ...articleFiles.map((f) => ({
    file: `writing/${f}`,
    url: `${ORIGIN}/writing/${f.replace(/\.html$/, '')}`,
    type: 'BlogPosting',
  })),
];

describe.each(PAGES)('$file', ({ file, url, type }) => {
  let doc;

  beforeAll(() => {
    doc = new DOMParser().parseFromString(fs.readFileSync(path.join(root, file), 'utf8'), 'text/html');
  });

  test('title includes the author name', () => {
    expect(doc.title).toMatch(/Siddharth Salunke/);
  });

  test('meta description is 50-160 characters', () => {
    const len = doc.querySelector('meta[name="description"]').getAttribute('content').length;
    expect(len).toBeGreaterThanOrEqual(50);
    expect(len).toBeLessThanOrEqual(160);
  });

  test('canonical and og:url point at the clean URL', () => {
    expect(doc.querySelector('link[rel="canonical"]').getAttribute('href')).toBe(url);
    expect(doc.querySelector('meta[property="og:url"]').getAttribute('content')).toBe(url);
  });

  test('has exactly one h1', () => {
    expect(doc.querySelectorAll('h1').length).toBe(1);
  });

  test(`JSON-LD is a ${type} for this URL`, () => {
    const schema = JSON.parse(doc.querySelector('script[type="application/ld+json"]').textContent);
    expect(schema['@type']).toBe(type);
    expect(schema.url).toBe(url);
  });

  // Pages can live below the site root, so a relative asset path would 404.
  test('stylesheet, script and favicon use root-relative URLs', () => {
    expect(doc.querySelector('link[rel="stylesheet"]').getAttribute('href')).toBe('/styles/main.css');
    expect(doc.querySelector('script[src]').getAttribute('src')).toBe('/js/app.js');
    expect(doc.querySelector('link[rel="icon"]').getAttribute('href')).toBe('/favicon.svg');
  });

  test('is listed in the sitemap', () => {
    expect(fs.readFileSync(path.join(root, 'sitemap_index.xml'), 'utf8')).toContain(`<loc>${url}</loc>`);
  });
});

describe('writing index', () => {
  test('there is at least one article', () => {
    expect(articleFiles.length).toBeGreaterThan(0);
  });

  test.each(articleFiles)('index links to %s', (post) => {
    const index = fs.readFileSync(path.join(root, 'writing.html'), 'utf8');
    expect(index).toContain(`href="/writing/${post.replace(/\.html$/, '')}"`);
  });
});

describe('articles carry no draft markers', () => {
  // Fails while a draft note is still in the page, so an unfinished article
  // cannot be merged by accident.
  test.each(articleFiles)('%s', (post) => {
    expect(fs.readFileSync(path.join(root, 'writing', post), 'utf8')).not.toContain('post__draft-note');
  });
});
