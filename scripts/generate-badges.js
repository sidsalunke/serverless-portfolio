'use strict';

/**
 * generate-badges.js
 *
 * Reads coverage/coverage-summary.json and the Lighthouse CI manifest
 * (written to .lighthouseci/ by lhci autorun) and emits SVG badge files
 * to badges/ using the badge-maker library (no external service needed).
 *
 * Usage:
 *   node scripts/generate-badges.js
 *
 * Environment variables (optional):
 *   LHCI_BUILD_CONTEXT__CURRENT_BRANCH  – set automatically by lhci
 *
 * Output files:
 *   badges/coverage.svg
 *   badges/lh-performance.svg
 *   badges/lh-accessibility.svg
 *   badges/lh-best-practices.svg
 *   badges/lh-seo.svg
 */

const fs   = require('fs');
const path = require('path');
const { makeBadge } = require('badge-maker');

// ── Helpers ─────────────────────────────────────────────────────────────────

/** Pick a colour based on a 0-100 score. */
function scoreColor(score) {
  if (score >= 90) return 'brightgreen';
  if (score >= 70) return 'yellow';
  if (score >= 50) return 'orange';
  return 'red';
}

/** Write an SVG badge to badges/<name>.svg */
function writeBadge(name, label, message, color) {
  const svg = makeBadge({ label, message, color, style: 'flat' });
  const outPath = path.join(__dirname, '..', 'badges', `${name}.svg`);
  fs.writeFileSync(outPath, svg, 'utf8');
  console.log(`  ✓ badges/${name}.svg  [${label}: ${message}]`);
}

// ── Coverage badge ───────────────────────────────────────────────────────────

function generateCoverageBadge() {
  const summaryPath = path.join(__dirname, '..', 'coverage', 'coverage-summary.json');

  if (!fs.existsSync(summaryPath)) {
    console.warn('  ⚠ coverage/coverage-summary.json not found — skipping coverage badge');
    writeBadge('coverage', 'coverage', 'unknown', 'lightgrey');
    return;
  }

  const summary = JSON.parse(fs.readFileSync(summaryPath, 'utf8'));
  const total   = summary.total;

  // Use lines percentage as the headline coverage number
  const pct   = Math.floor(total.lines.pct);
  const color = scoreColor(pct);

  writeBadge('coverage', 'coverage', `${pct}%`, color);
}

// ── Lighthouse badges ────────────────────────────────────────────────────────

const LH_CATEGORIES = [
  { key: 'performance',    label: 'lh performance' },
  { key: 'accessibility',  label: 'lh accessibility' },
  { key: 'best-practices', label: 'lh best practices' },
  { key: 'seo',            label: 'lh seo' },
];

function generateLighthouseBadges() {
  // lhci autorun writes results to .lighthouseci/
  const lhciDir = path.join(__dirname, '..', '.lighthouseci');

  if (!fs.existsSync(lhciDir)) {
    console.warn('  ⚠ .lighthouseci/ not found — writing placeholder Lighthouse badges');
    for (const cat of LH_CATEGORIES) {
      writeBadge(`lh-${cat.key}`, cat.label, 'unknown', 'lightgrey');
    }
    return;
  }

  // Find the most recent manifest file written by lhci
  const files = fs.readdirSync(lhciDir).filter(f => f.endsWith('.json') && !f.startsWith('assert'));

  if (files.length === 0) {
    console.warn('  ⚠ No Lighthouse result JSON files found in .lighthouseci/');
    for (const cat of LH_CATEGORIES) {
      writeBadge(`lh-${cat.key}`, cat.label, 'unknown', 'lightgrey');
    }
    return;
  }

  // Aggregate scores across all runs (lhci takes 3 runs by default)
  const scores = {};
  for (const cat of LH_CATEGORIES) {
    scores[cat.key] = [];
  }

  for (const file of files) {
    if (!file.startsWith('lhr-')) continue; // only Lighthouse Result files
    try {
      const lhr = JSON.parse(fs.readFileSync(path.join(lhciDir, file), 'utf8'));
      for (const cat of LH_CATEGORIES) {
        const catKey = cat.key === 'best-practices' ? 'best-practices' : cat.key;
        const catData = lhr.categories && lhr.categories[catKey];
        if (catData && typeof catData.score === 'number') {
          scores[catKey].push(catData.score);
        }
      }
    } catch (e) {
      // skip malformed files
    }
  }

  for (const cat of LH_CATEGORIES) {
    const runs = scores[cat.key];
    if (runs.length === 0) {
      writeBadge(`lh-${cat.key}`, cat.label, 'unknown', 'lightgrey');
      continue;
    }
    // Use median score across runs
    runs.sort((a, b) => a - b);
    const median = runs[Math.floor(runs.length / 2)];
    const pct    = Math.round(median * 100);
    writeBadge(`lh-${cat.key}`, cat.label, String(pct), scoreColor(pct));
  }
}

// ── Main ─────────────────────────────────────────────────────────────────────

function main() {
  const badgesDir = path.join(__dirname, '..', 'badges');
  if (!fs.existsSync(badgesDir)) {
    fs.mkdirSync(badgesDir, { recursive: true });
  }

  console.log('Generating badges…');
  generateCoverageBadge();
  generateLighthouseBadges();
  console.log('Done.');
}

main();
