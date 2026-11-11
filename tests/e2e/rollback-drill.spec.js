const { test, expect } = require('@playwright/test');

/**
 * ROLLBACK DRILL — temporary. Delete together with the marker in index.html.
 *
 * Purpose: prove that a failing live E2E run makes the deploy workflow
 * restore the previous commit. The homepage carries an invisible
 * <meta name="rollback-drill"> marker; this test fails when it sees the
 * marker on the live site.
 *
 * Skipped unless BASE_URL is set, so PR checks (which run against the local
 * dev server) stay green and the change can be merged. Only the post-deploy
 * e2e-live job sets BASE_URL.
 */
test.describe('rollback drill', () => {
  test.skip(!process.env.BASE_URL, 'live-only: runs in the post-deploy e2e-live job');

  test('live homepage does not carry the rollback-drill marker', async ({ request }) => {
    const res = await request.get('/');
    expect(res.status()).toBe(200);
    expect(await res.text()).not.toContain('name="rollback-drill"');
  });
});
