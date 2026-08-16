'use strict';

/**
 * SEO unit tests — run on every PR via Jest / jsdom.
 *
 * These tests parse the raw HTML file (no browser needed) and assert that
 * all SEO-critical markup is present and correct.  They are fast (~ms) and
 * give immediate feedback before any deployment happens.
 *
 * What is NOT tested here (tested elsewhere):
 *   - Lighthouse scores       → post-deploy only (update-badges job in deploy.yml)
 *   - HTTP response headers   → tests/e2e/security.spec.js (Playwright)
 *   - Runtime rendering       → tests/e2e/seo.spec.js (Playwright)
 */

const fs   = require('fs');
const path = require('path');

// jest-environment-jsdom provides DOMParser as a global — no import needed.
// Do NOT require('jsdom') directly; it conflicts with the test environment.

const CANONICAL_URL       = 'https://portfolio.sidsalunke.info';
const AI_CANONICAL_URL    = 'https://portfolio.sidsalunke.info/ai-engineering.html';
const QUALITY_CANONICAL_URL = 'https://portfolio.sidsalunke.info/testing.html';

let doc;
let aiDoc;
let testingDoc;

beforeAll(() => {
  const html = fs.readFileSync(path.join(__dirname, '../../index.html'), 'utf8');
  doc = new DOMParser().parseFromString(html, 'text/html');

  const aiHtml = fs.readFileSync(path.join(__dirname, '../../ai-engineering.html'), 'utf8');
  aiDoc = new DOMParser().parseFromString(aiHtml, 'text/html');

  const testingHtml = fs.readFileSync(path.join(__dirname, '../../testing.html'), 'utf8');
  testingDoc = new DOMParser().parseFromString(testingHtml, 'text/html');
});

// ── Favicon ──────────────────────────────────────────────────────────────────

describe('Favicon', () => {
  test.each([
    ['index.html', () => doc],
    ['ai-engineering.html', () => aiDoc],
    ['testing.html', () => testingDoc],
  ])('%s has a favicon link pointing at favicon.svg', (_name, getDoc) => {
    const icon = getDoc().querySelector('link[rel="icon"]');
    expect(icon).not.toBeNull();
    expect(icon.getAttribute('href')).toBe('favicon.svg');
  });
});

// ── Primary SEO tags ─────────────────────────────────────────────────────────

describe('Primary SEO', () => {
  test('<title> is present and non-empty', () => {
    expect(doc.title.trim().length).toBeGreaterThan(10);
  });

  test('<title> includes the person name', () => {
    expect(doc.title).toMatch(/Siddharth Salunke/i);
  });

  test('meta description is present', () => {
    const el = doc.querySelector('meta[name="description"]');
    expect(el).not.toBeNull();
  });

  test('meta description is between 50 and 160 characters (Google snippet window)', () => {
    const content = doc.querySelector('meta[name="description"]').getAttribute('content');
    expect(content.length).toBeGreaterThanOrEqual(50);
    expect(content.length).toBeLessThanOrEqual(160);
  });

  test('meta description contains relevant keywords', () => {
    const content = doc.querySelector('meta[name="description"]').getAttribute('content').toLowerCase();
    // At least two of the core professional keywords should appear
    const keywords = ['quality engineer', 'test automation', 'performance', 'playwright', 'kubernetes', 'aws'];
    const matches  = keywords.filter(kw => content.includes(kw));
    expect(matches.length).toBeGreaterThanOrEqual(2);
  });

  test('robots meta tag allows indexing and following', () => {
    const el = doc.querySelector('meta[name="robots"]');
    expect(el).not.toBeNull();
    const content = el.getAttribute('content');
    expect(content).toMatch(/index/);
    expect(content).toMatch(/follow/);
  });

  test('canonical link is present', () => {
    expect(doc.querySelector('link[rel="canonical"]')).not.toBeNull();
  });

  test('canonical link points to the live domain', () => {
    const href = doc.querySelector('link[rel="canonical"]').getAttribute('href');
    expect(href).toBe(CANONICAL_URL);
  });

  test('html lang attribute is set to "en"', () => {
    expect(doc.documentElement.getAttribute('lang')).toBe('en');
  });
});

// ── Open Graph ───────────────────────────────────────────────────────────────

describe('Open Graph', () => {
  function og(prop) {
    return doc.querySelector(`meta[property="og:${prop}"]`);
  }

  test('og:type is "website"', () => {
    expect(og('type')).not.toBeNull();
    expect(og('type').getAttribute('content')).toBe('website');
  });

  test('og:url matches canonical', () => {
    expect(og('url')).not.toBeNull();
    expect(og('url').getAttribute('content')).toBe(CANONICAL_URL);
  });

  test('og:title is present and non-empty', () => {
    expect(og('title')).not.toBeNull();
    expect(og('title').getAttribute('content').length).toBeGreaterThan(5);
  });

  test('og:description is present (40+ chars)', () => {
    expect(og('description')).not.toBeNull();
    expect(og('description').getAttribute('content').length).toBeGreaterThanOrEqual(40);
  });

  test('og:image is present and is an absolute URL', () => {
    expect(og('image')).not.toBeNull();
    expect(og('image').getAttribute('content')).toMatch(/^https?:\/\//);
  });
});

// ── Twitter / X Card ─────────────────────────────────────────────────────────

describe('Twitter Card', () => {
  function tw(name) {
    return doc.querySelector(`meta[name="twitter:${name}"]`);
  }

  test('twitter:card is present', () => {
    expect(tw('card')).not.toBeNull();
    expect(['summary', 'summary_large_image']).toContain(tw('card').getAttribute('content'));
  });

  test('twitter:title is present', () => {
    expect(tw('title')).not.toBeNull();
    expect(tw('title').getAttribute('content').length).toBeGreaterThan(5);
  });

  test('twitter:description is present (40+ chars)', () => {
    expect(tw('description')).not.toBeNull();
    expect(tw('description').getAttribute('content').length).toBeGreaterThanOrEqual(40);
  });
});

// ── JSON-LD structured data ───────────────────────────────────────────────────

describe('JSON-LD structured data', () => {
  let schema;

  beforeAll(() => {
    const el = doc.querySelector('script[type="application/ld+json"]');
    expect(el).not.toBeNull();
    schema = JSON.parse(el.textContent);
  });

  test('@context is schema.org', () => {
    expect(schema['@context']).toBe('https://schema.org');
  });

  test('@type is Person', () => {
    expect(schema['@type']).toBe('Person');
  });

  test('name is present', () => {
    expect(schema.name).toBe('Siddharth Salunke');
  });

  test('jobTitle is present', () => {
    expect(schema.jobTitle).toBeTruthy();
  });

  test('url matches canonical', () => {
    expect(schema.url).toBe(CANONICAL_URL);
  });

  test('sameAs includes LinkedIn profile', () => {
    expect(schema.sameAs).toEqual(
      expect.arrayContaining([expect.stringContaining('linkedin.com/in/sidsalunke')])
    );
  });

  test('sameAs includes GitHub profile', () => {
    expect(schema.sameAs).toEqual(
      expect.arrayContaining([expect.stringContaining('github.com/sidsalunke')])
    );
  });

  test('worksFor is an Organization', () => {
    expect(schema.worksFor).toBeDefined();
    expect(schema.worksFor['@type']).toBe('Organization');
    expect(schema.worksFor.name).toBeTruthy();
  });

  test('image is an absolute URL', () => {
    expect(schema.image).toMatch(/^https?:\/\//);
  });

  test('JSON-LD is valid JSON (no parse errors)', () => {
    // If beforeAll got here, JSON.parse succeeded — this is a sanity assertion
    expect(typeof schema).toBe('object');
  });
});

// ── Document structure ────────────────────────────────────────────────────────

describe('Document structure (SEO signals)', () => {
  test('exactly one <h1> on the page', () => {
    expect(doc.querySelectorAll('h1').length).toBe(1);
  });

  test('h3 headings only appear where there are h2 headings', () => {
    const h2Count = doc.querySelectorAll('h2').length;
    const h3Count = doc.querySelectorAll('h3').length;
    if (h3Count > 0) {
      expect(h2Count).toBeGreaterThan(0);
    }
  });

  test('all <img> elements have non-empty alt text', () => {
    doc.querySelectorAll('img').forEach(img => {
      expect(img.getAttribute('alt') || '').not.toBe('');
    });
  });

  test('<html> has lang attribute', () => {
    expect(doc.documentElement.hasAttribute('lang')).toBe(true);
  });
});

// ── ai-engineering.html ───────────────────────────────────────────────────────

describe('AI Engineering page — Primary SEO', () => {
  test('<title> is present and includes the person name', () => {
    expect(aiDoc.title.trim().length).toBeGreaterThan(10);
    expect(aiDoc.title).toMatch(/Siddharth Salunke/i);
  });

  test('meta description is between 50 and 160 characters', () => {
    const content = aiDoc.querySelector('meta[name="description"]').getAttribute('content');
    expect(content.length).toBeGreaterThanOrEqual(50);
    expect(content.length).toBeLessThanOrEqual(160);
  });

  test('meta description mentions AI/Claude', () => {
    const content = aiDoc.querySelector('meta[name="description"]').getAttribute('content').toLowerCase();
    expect(content).toMatch(/claude|ai tools/);
  });

  test('robots meta tag allows indexing and following', () => {
    const content = aiDoc.querySelector('meta[name="robots"]').getAttribute('content');
    expect(content).toMatch(/index/);
    expect(content).toMatch(/follow/);
  });

  test('canonical link points to the ai-engineering page', () => {
    const href = aiDoc.querySelector('link[rel="canonical"]').getAttribute('href');
    expect(href).toBe(AI_CANONICAL_URL);
  });

  test('<html> has lang attribute', () => {
    expect(aiDoc.documentElement.hasAttribute('lang')).toBe(true);
  });
});

describe('AI Engineering page — Open Graph', () => {
  function og(prop) {
    return aiDoc.querySelector(`meta[property="og:${prop}"]`);
  }

  test('og:type is "website"', () => {
    expect(og('type').getAttribute('content')).toBe('website');
  });

  test('og:url matches canonical', () => {
    expect(og('url').getAttribute('content')).toBe(AI_CANONICAL_URL);
  });

  test('og:title is present and non-empty', () => {
    expect(og('title').getAttribute('content').length).toBeGreaterThan(5);
  });

  test('og:description is present (40+ chars)', () => {
    expect(og('description').getAttribute('content').length).toBeGreaterThanOrEqual(40);
  });

  test('og:image is present and is an absolute URL', () => {
    expect(og('image').getAttribute('content')).toMatch(/^https?:\/\//);
  });
});

describe('AI Engineering page — Twitter Card', () => {
  function tw(name) {
    return aiDoc.querySelector(`meta[name="twitter:${name}"]`);
  }

  test('twitter:card is present', () => {
    expect(['summary', 'summary_large_image']).toContain(tw('card').getAttribute('content'));
  });

  test('twitter:title is present', () => {
    expect(tw('title').getAttribute('content').length).toBeGreaterThan(5);
  });

  test('twitter:description is present (40+ chars)', () => {
    expect(tw('description').getAttribute('content').length).toBeGreaterThanOrEqual(40);
  });
});

describe('AI Engineering page — JSON-LD structured data', () => {
  let schema;

  beforeAll(() => {
    const el = aiDoc.querySelector('script[type="application/ld+json"]');
    expect(el).not.toBeNull();
    schema = JSON.parse(el.textContent);
  });

  test('@context is schema.org', () => {
    expect(schema['@context']).toBe('https://schema.org');
  });

  test('@type is WebPage', () => {
    expect(schema['@type']).toBe('WebPage');
  });

  test('url matches canonical', () => {
    expect(schema.url).toBe(AI_CANONICAL_URL);
  });

  test('isPartOf references the portfolio website', () => {
    expect(schema.isPartOf).toBeDefined();
    expect(schema.isPartOf['@type']).toBe('WebSite');
  });

  test('author is the Person', () => {
    expect(schema.author).toBeDefined();
    expect(schema.author['@type']).toBe('Person');
    expect(schema.author.name).toBe('Siddharth Salunke');
  });

  test('JSON-LD is valid JSON (no parse errors)', () => {
    expect(typeof schema).toBe('object');
  });
});

describe('AI Engineering page — Document structure (SEO signals)', () => {
  test('exactly one <h1> on the page', () => {
    expect(aiDoc.querySelectorAll('h1').length).toBe(1);
  });

  test('all <img> elements have non-empty alt text', () => {
    aiDoc.querySelectorAll('img').forEach(img => {
      expect(img.getAttribute('alt') || '').not.toBe('');
    });
  });

  test('no <title> tag appears more than once', () => {
    expect(aiDoc.querySelectorAll('title').length).toBe(1);
  });
});

// ── testing.html (Quality Suite) ──────────────────────────────────────────────

describe('Quality Suite page — Primary SEO', () => {
  test('<title> is present and includes the person name', () => {
    expect(testingDoc.title.trim().length).toBeGreaterThan(10);
    expect(testingDoc.title).toMatch(/Siddharth Salunke/i);
  });

  test('meta description is between 50 and 160 characters', () => {
    const content = testingDoc.querySelector('meta[name="description"]').getAttribute('content');
    expect(content.length).toBeGreaterThanOrEqual(50);
    expect(content.length).toBeLessThanOrEqual(160);
  });

  test('meta description mentions the test suite', () => {
    const content = testingDoc.querySelector('meta[name="description"]').getAttribute('content').toLowerCase();
    expect(content).toMatch(/test|accessibility|security|e2e/);
  });

  test('robots meta tag allows indexing and following', () => {
    const content = testingDoc.querySelector('meta[name="robots"]').getAttribute('content');
    expect(content).toMatch(/index/);
    expect(content).toMatch(/follow/);
  });

  test('canonical link points to the testing page', () => {
    const href = testingDoc.querySelector('link[rel="canonical"]').getAttribute('href');
    expect(href).toBe(QUALITY_CANONICAL_URL);
  });

  test('<html> has lang attribute', () => {
    expect(testingDoc.documentElement.hasAttribute('lang')).toBe(true);
  });
});

describe('Quality Suite page — Open Graph', () => {
  function og(prop) {
    return testingDoc.querySelector(`meta[property="og:${prop}"]`);
  }

  test('og:type is "website"', () => {
    expect(og('type').getAttribute('content')).toBe('website');
  });

  test('og:url matches canonical', () => {
    expect(og('url').getAttribute('content')).toBe(QUALITY_CANONICAL_URL);
  });

  test('og:title is present and non-empty', () => {
    expect(og('title').getAttribute('content').length).toBeGreaterThan(5);
  });

  test('og:description is present (40+ chars)', () => {
    expect(og('description').getAttribute('content').length).toBeGreaterThanOrEqual(40);
  });

  test('og:image is present and is an absolute URL', () => {
    expect(og('image').getAttribute('content')).toMatch(/^https?:\/\//);
  });
});

describe('Quality Suite page — Twitter Card', () => {
  function tw(name) {
    return testingDoc.querySelector(`meta[name="twitter:${name}"]`);
  }

  test('twitter:card is present', () => {
    expect(['summary', 'summary_large_image']).toContain(tw('card').getAttribute('content'));
  });

  test('twitter:title is present', () => {
    expect(tw('title').getAttribute('content').length).toBeGreaterThan(5);
  });

  test('twitter:description is present (40+ chars)', () => {
    expect(tw('description').getAttribute('content').length).toBeGreaterThanOrEqual(40);
  });
});

describe('Quality Suite page — JSON-LD structured data', () => {
  let schema;

  beforeAll(() => {
    const el = testingDoc.querySelector('script[type="application/ld+json"]');
    expect(el).not.toBeNull();
    schema = JSON.parse(el.textContent);
  });

  test('@context is schema.org', () => {
    expect(schema['@context']).toBe('https://schema.org');
  });

  test('@type is WebPage', () => {
    expect(schema['@type']).toBe('WebPage');
  });

  test('url matches canonical', () => {
    expect(schema.url).toBe(QUALITY_CANONICAL_URL);
  });

  test('isPartOf references the portfolio website', () => {
    expect(schema.isPartOf).toBeDefined();
    expect(schema.isPartOf['@type']).toBe('WebSite');
  });

  test('author is the Person', () => {
    expect(schema.author).toBeDefined();
    expect(schema.author['@type']).toBe('Person');
    expect(schema.author.name).toBe('Siddharth Salunke');
  });

  test('JSON-LD is valid JSON (no parse errors)', () => {
    expect(typeof schema).toBe('object');
  });
});

describe('Quality Suite page — Document structure (SEO signals)', () => {
  test('exactly one <h1> on the page', () => {
    expect(testingDoc.querySelectorAll('h1').length).toBe(1);
  });

  test('all <img> elements have non-empty alt text', () => {
    testingDoc.querySelectorAll('img').forEach(img => {
      expect(img.getAttribute('alt') || '').not.toBe('');
    });
  });

  test('no <title> tag appears more than once', () => {
    expect(testingDoc.querySelectorAll('title').length).toBe(1);
  });
});
