'use strict';

/**
 * Regression guard for the deploy workflow's rollback gate.
 *
 * GitHub Actions prepends an implicit success() to any job-level `if` that
 * contains no status function (success/failure/always/cancelled). A rollback
 * job gated only on `needs.e2e-live.result == 'failure'` is therefore skipped
 * whenever e2e-live fails — it can never run. This shipped unnoticed for
 * months, so the condition is pinned here.
 */

const fs   = require('fs');
const path = require('path');

const workflow = fs.readFileSync(
  path.join(__dirname, '../../.github/workflows/deploy.yml'),
  'utf8'
);

function jobBlock(name) {
  const start = workflow.search(new RegExp(`^  ${name}:\s*$`, 'm'));
  expect(start).toBeGreaterThan(-1);
  const rest = workflow.slice(start + 1);
  const next = rest.search(/^  [a-z0-9-]+:\s*$/m);
  return next === -1 ? rest : rest.slice(0, next);
}

describe('deploy.yml rollback job', () => {
  const condition = (jobBlock('rollback').match(/^    if:\s*(.+)$/m) || [])[1];

  test('has a job-level condition', () => {
    expect(condition).toBeTruthy();
  });

  test('uses a status function so it is not skipped when e2e-live fails', () => {
    expect(condition).toMatch(/\b(always|failure)\(\)/);
  });

  test('only runs when the live E2E job failed after a successful deploy', () => {
    expect(condition).toContain("needs.e2e-live.result == 'failure'");
    expect(condition).toContain("needs.deploy.result == 'success'");
  });
});

/**
 * The rollback target. HEAD~1 is only "the last good version" when the
 * previous deploy was good; after a rollback it is the bad commit. The
 * deploy job reads the last-good-deploy tag instead, and mark-good moves
 * that tag only after live tests pass.
 */
describe('deploy.yml rollback target', () => {
  test('deploy reads the last-good-deploy tag, falling back to HEAD~1', () => {
    const deploy = jobBlock('deploy');
    expect(deploy).toContain('refs/tags/last-good-deploy');
    expect(deploy).toContain('git rev-parse HEAD~1');
    expect(deploy).toMatch(/previous-sha: \$\{\{ steps\.prev-sha\.outputs\.sha \}\}/);
  });

  test('rollback checks out the recorded SHA', () => {
    expect(jobBlock('rollback')).toMatch(/ref: \$\{\{ needs\.deploy\.outputs\.previous-sha \}\}/);
  });

  test('mark-good moves the tag only after live tests pass', () => {
    const markGood = jobBlock('mark-good');
    expect(markGood).toMatch(/^    if: .*needs\.e2e-live\.result == 'success'/m);
    expect(markGood).toMatch(/needs: \[deploy, e2e-live\]/);
    expect(markGood).toContain('git push --force origin refs/tags/last-good-deploy');
    expect(markGood).toMatch(/permissions:\s+contents: write/);
  });
});

/**
 * Supply-chain and privilege guardrails for every workflow.
 */
describe.each(['deploy.yml', 'pr.yml', 'update-snapshots.yml', 'smoke.yml'])('workflow hardening: %s', (file) => {
  const text = fs.readFileSync(path.join(__dirname, '../../.github/workflows', file), 'utf8').replace(/\r\n/g, '\n');

  test('default token permission is read-only', () => {
    expect(text).toMatch(/^permissions:\n  contents: read$/m);
  });

  test('every action is pinned to a full commit SHA', () => {
    const uses = [...text.matchAll(/^\s*(?:- )?uses: (\S+)/gm)].map((m) => m[1]);
    expect(uses.length).toBeGreaterThan(0);
    uses.forEach((ref) => expect(ref).toMatch(/@[0-9a-f]{40}$/));
  });

  // `npm install` may resolve newer versions than package-lock.json records;
  // `npm ci` installs exactly the lockfile and fails if it is out of date.
  test('installs dependencies from the lockfile with npm ci', () => {
    expect(text).toMatch(/run: npm ci$/m);
    expect(text).not.toMatch(/run: npm install$/m);
  });

  test('global tool installs name an exact version', () => {
    const globals = [...text.matchAll(/npm install -g (\S+)/g)].map((m) => m[1]);
    globals.forEach((spec) => expect(spec).toMatch(/@\d+\.\d+\.\d+$/));
  });

  test('does not use an end-of-life Node.js version', () => {
    const versions = [...text.matchAll(/node-version: '(\d+)'/g)].map((m) => Number(m[1]));
    versions.forEach((v) => expect(v).toBeGreaterThanOrEqual(22));
  });
});
