'use strict';

/**
 * Site-wide guardrails. These protect search visibility and deploy safety
 * from regressions that no single-page test would notice:
 *
 *   - the sitemap is the one list of indexable pages, and the three other
 *     hand-kept lists (llms.txt, .lighthouserc.json, the IndexNow ping in
 *     deploy.yml) must match it;
 *   - every indexable page keeps the on-page SEO basics;
 *   - pages that can be served from a nested path load their assets from
 *     root-relative URLs;
 *   - the rollback job uploads with the same cache headers as the deploy.
 */

const fs   = require('fs');
const path = require('path');

const ORIGIN = 'https://portfolio.sidsalunke.info';
const root   = path.join(__dirname, '../..');
const read   = (file) => fs.readFileSync(path.join(root, file), 'utf8');

const sitemapUrls = [...read('sitemap_index.xml').matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);

// https://portfolio.sidsalunke.info/writing/foo -> writing/foo.html
const fileFor = (url) => {
  const pathname = url.slice(ORIGIN.length).replace(/^\//, '');
  return pathname === '' ? 'index.html' : `${pathname}.html`;
};

const parse = (file) => new DOMParser().parseFromString(read(file), 'text/html');

const normalise = (url) => url.replace(/\/$/, '');

describe('sitemap is the single list of indexable pages', () => {
  test('lists at least the five known pages', () => {
    expect(sitemapUrls.length).toBeGreaterThanOrEqual(5);
  });

  test.each(sitemapUrls)('%s maps to a file in the repo', (url) => {
    expect(fs.existsSync(path.join(root, fileFor(url)))).toBe(true);
  });

  test('every indexable HTML file is in the sitemap', () => {
    const rootPages = fs.readdirSync(root).filter((f) => f.endsWith('.html') && f !== '404.html');
    const articles  = fs.readdirSync(path.join(root, 'writing')).filter((f) => f.endsWith('.html')).map((f) => `writing/${f}`);
    const listed    = sitemapUrls.map(fileFor);
    expect([...rootPages, ...articles].sort()).toEqual(listed.sort());
  });

  test('llms.txt links every sitemap URL', () => {
    const linked = [...read('llms.txt').matchAll(/\]\((https:\/\/portfolio\.sidsalunke\.info[^)]*)\)/g)].map((m) => normalise(m[1]));
    expect(linked.sort()).toEqual([...sitemapUrls].sort());
  });

  test('.lighthouserc.json audits every sitemap URL', () => {
    const audited = JSON.parse(read('.lighthouserc.json')).ci.collect.url.map(normalise);
    expect(audited.sort()).toEqual([...sitemapUrls].sort());
  });

  test('the IndexNow ping in deploy.yml submits every sitemap URL', () => {
    const block = read('.github/workflows/deploy.yml').match(/"urlList": \[([\s\S]*?)\]/);
    expect(block).not.toBeNull();
    const pinged = [...block[1].matchAll(/"(https:[^"]+)"/g)].map((m) => normalise(m[1]));
    expect(pinged.sort()).toEqual([...sitemapUrls].sort());
  });
});

describe.each(sitemapUrls)('on-page SEO: %s', (url) => {
  let doc;
  beforeAll(() => { doc = parse(fileFor(url)); });

  const meta = (selector) => {
    const el = doc.querySelector(selector);
    return el ? el.getAttribute('content') : null;
  };

  test('title is 30-65 characters', () => {
    expect(doc.title.length).toBeGreaterThanOrEqual(30);
    expect(doc.title.length).toBeLessThanOrEqual(65);
  });

  test('meta description is 120-160 characters', () => {
    const description = meta('meta[name="description"]');
    expect(description).not.toBeNull();
    expect(description.length).toBeGreaterThanOrEqual(120);
    expect(description.length).toBeLessThanOrEqual(160);
  });

  test('has exactly one h1', () => {
    expect(doc.querySelectorAll('h1').length).toBe(1);
  });

  test('canonical is the sitemap URL', () => {
    expect(doc.querySelector('link[rel="canonical"]').getAttribute('href')).toBe(url);
  });

  test('is indexable', () => {
    expect(meta('meta[name="robots"]')).toBe('index, follow');
  });

  test('declares language and viewport', () => {
    expect(doc.documentElement.getAttribute('lang')).toBe('en');
    expect(meta('meta[name="viewport"]')).toMatch(/width=device-width/);
  });

  test('has Open Graph and Twitter card tags', () => {
    expect(meta('meta[property="og:title"]')).toBeTruthy();
    expect(meta('meta[property="og:description"]')).toBeTruthy();
    expect(meta('meta[property="og:image"]')).toMatch(/^https:\/\/portfolio\.sidsalunke\.info\//);
    expect(meta('meta[property="og:url"]')).toBe(url);
    expect(meta('meta[name="twitter:card"]')).toBeTruthy();
  });

  test('every JSON-LD block parses', () => {
    const blocks = [...doc.querySelectorAll('script[type="application/ld+json"]')];
    expect(blocks.length).toBeGreaterThan(0);
    blocks.forEach((block) => expect(() => JSON.parse(block.textContent)).not.toThrow());
  });
});

describe('titles and descriptions are unique across pages', () => {
  const docs = sitemapUrls.map((url) => parse(fileFor(url)));

  test('titles', () => {
    const titles = docs.map((d) => d.title);
    expect(new Set(titles).size).toBe(titles.length);
  });

  test('descriptions', () => {
    const descriptions = docs.map((d) => d.querySelector('meta[name="description"]').getAttribute('content'));
    expect(new Set(descriptions).size).toBe(descriptions.length);
  });
});

// CloudFront serves 404.html for any unknown path, including nested ones
// such as /writing/missing, and articles live under /writing/. A relative
// asset URL on those pages resolves against the nested path and 404s.
describe('pages served from nested paths use root-relative assets', () => {
  const nested = ['404.html', ...fs.readdirSync(path.join(root, 'writing')).filter((f) => f.endsWith('.html')).map((f) => `writing/${f}`)];

  test.each(nested)('%s', (file) => {
    const doc  = parse(file);
    const urls = [
      ...[...doc.querySelectorAll('link[href]')].map((el) => el.getAttribute('href')),
      ...[...doc.querySelectorAll('script[src], img[src], source[srcset]')].map((el) => el.getAttribute('src') || el.getAttribute('srcset')),
    ];
    const relative = urls.filter((u) => !/^(\/|https?:|data:|#)/.test(u));
    expect(relative).toEqual([]);
  });

  test('404.html is not indexable', () => {
    expect(parse('404.html').querySelector('meta[name="robots"]').getAttribute('content')).toMatch(/noindex/);
  });
});

// The budgets themselves are guarded: loosening one, or downgrading it to a
// warning, has to be a deliberate edit to this test as well.
describe('Lighthouse budgets', () => {
  const BUDGET = {
    'categories:performance':    0.9,
    'categories:accessibility':  1.0,
    'categories:best-practices': 1.0,
    'categories:seo':            1.0,
  };

  test.each(['.lighthouserc.json', '.lighthouserc.pr.json'])('%s fails the build below budget', (file) => {
    const { assertions } = JSON.parse(read(file)).ci.assert;
    Object.entries(BUDGET).forEach(([category, minScore]) => {
      const [level, options] = assertions[category];
      expect(level).toBe('error');
      expect(options.minScore).toBeGreaterThanOrEqual(minScore);
      expect(options.aggregationMethod).toBe('median-run');
    });
  });

  test('the PR audit covers every sitemap URL', () => {
    const audited = JSON.parse(read('.lighthouserc.pr.json')).ci.collect.url
      .map((u) => normalise(u.replace('http://localhost:4173', ORIGIN)));
    expect(audited.sort()).toEqual([...sitemapUrls].sort());
  });

  test('both workflows run a pinned Lighthouse CI version', () => {
    expect(read('.github/workflows/pr.yml')).toMatch(/@lhci\/cli@\d+\.\d+\.\d+ autorun/);
    expect(read('.github/workflows/deploy.yml')).toMatch(/npm install -g @lhci\/cli@\d+\.\d+\.\d+/);
  });

  test('a failed live audit fails the deploy workflow', () => {
    expect(read('.github/workflows/deploy.yml')).toMatch(/if: steps\.lhci\.outcome == 'failure'/);
  });
});

// The skip link must be the first focusable element, and its target must
// exist, on every page including the 404 page.
describe('skip link', () => {
  const pages = [...sitemapUrls.map(fileFor), '404.html'];

  test.each(pages)('%s: first focusable element skips to <main>', (file) => {
    const doc = parse(file);
    const first = doc.body.querySelector('a[href], button, input, select, textarea, [tabindex]');
    expect(first.getAttribute('class')).toBe('skip-link');
    expect(first.getAttribute('href')).toBe('#main-content');
    expect(first.textContent.trim()).toBe('Skip to main content');
    expect(doc.querySelectorAll('main#main-content').length).toBe(1);
  });
});

// The local static server is a pinned devDependency, so PR checks do not
// download whatever `npx serve` resolves to on the day.
describe('local static server', () => {
  const pkg = JSON.parse(read('package.json'));

  test('serve is pinned to an exact version', () => {
    expect(pkg.devDependencies.serve).toMatch(/^\d+\.\d+\.\d+$/);
  });

  test('Playwright and Lighthouse start it through npm scripts', () => {
    expect(pkg.scripts.start).toMatch(/^serve /);
    expect(pkg.scripts['serve:lhci']).toMatch(/^serve -l 4173 /);
    expect(read('playwright.config.js')).toMatch(/command: 'npm start'/);
    expect(JSON.parse(read('.lighthouserc.pr.json')).ci.collect.startServerCommand).toBe('npm run serve:lhci');
  });
});

describe('smoke.yml', () => {
  const workflow = read('.github/workflows/smoke.yml').replace(/\r\n/g, '\n');

  test('runs on a daily schedule against production', () => {
    expect(workflow).toMatch(/schedule:\n(?:\s*#.*\n)*\s*- cron: '\d+ \d+ \* \* \*'/);
    expect(workflow).toMatch(/BASE_URL: https:\/\/portfolio\.sidsalunke\.info/);
  });

  test('every spec it names exists, and the visual spec is not one of them', () => {
    const specs = [...workflow.matchAll(/tests\/e2e\/[\w-]+\.spec\.js/g)].map((m) => m[0]);
    expect(specs.length).toBeGreaterThan(0);
    specs.forEach((spec) => expect(fs.existsSync(path.join(root, spec))).toBe(true));
    expect(specs).not.toContain('tests/e2e/visual.spec.js');
  });

  test('reports a failure as an issue and holds no AWS credentials', () => {
    expect(workflow).toMatch(/issues: write/);
    expect(workflow).toMatch(/issues\.create\(/);
    expect(workflow).not.toMatch(/configure-aws-credentials|id-token/);
  });
});

describe('deploy.yml', () => {
  const workflow = read('.github/workflows/deploy.yml').replace(/\r\n/g, '\n');
  const cacheHeaders = (block) => [...block.matchAll(/--cache-control "([^"]+)"/g)].map((m) => m[1]);

  const rollbackStart = workflow.search(/^  rollback:\s*$/m);
  const deployBlock   = workflow.slice(workflow.search(/^  deploy:\s*$/m), workflow.search(/^  sbom:\s*$/m));
  const rollbackBlock = workflow.slice(rollbackStart, workflow.search(/^  update-badges:\s*$/m));

  test('rollback uploads with the same cache headers as deploy', () => {
    expect(cacheHeaders(deployBlock).length).toBe(4);
    expect(cacheHeaders(rollbackBlock)).toEqual(cacheHeaders(deployBlock));
  });

  // "no-cache" or a missing shared-cache lifetime turns every request into
  // an origin round trip: see the comment above the sync steps.
  test('short-lived files keep a long shared-cache lifetime', () => {
    const shortLived = cacheHeaders(deployBlock).filter((h) => /max-age=60\b/.test(h));
    expect(shortLived.length).toBe(3);
    shortLived.forEach((h) => expect(h).toMatch(/s-maxage=86400/));
    cacheHeaders(deployBlock).forEach((h) => expect(h).not.toMatch(/no-cache|no-store/));
  });

  test('deploys are serialised', () => {
    expect(workflow).toMatch(/^concurrency:\n  group: deploy-production\n  cancel-in-progress: false$/m);
  });
});
