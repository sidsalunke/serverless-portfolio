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
