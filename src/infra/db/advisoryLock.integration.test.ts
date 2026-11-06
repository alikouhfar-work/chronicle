// @vitest-environment node

import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { Client } from 'pg';

const integrationEnabled = process.env.INTEGRATION_DB === '1';

const databaseName = (() => {
  try {
    return new URL(process.env.DATABASE_URL ?? '').pathname.replace(/^\//, '');
  } catch {
    return '';
  }
})();

if (integrationEnabled && !databaseName.endsWith('_test')) {
  throw new Error(
    `Refusing to run integration tests against "${databaseName || '(missing database)'}". ` +
      'Set DATABASE_URL to a database whose name ends in "_test".',
  );
}

// A key nothing else in the app uses, so a stray lock cannot flake this suite.
const TEST_KEY = 424_242;

let acquireAdvisoryLock!: typeof import('@/infra/db/advisoryLock').acquireAdvisoryLock;

/**
 * Advisory locks are session-scoped, which is the whole reason this helper
 * exists instead of calling `prisma.$queryRaw` inline: the lock and the unlock
 * must land on the same connection. These checks prove that a second caller —
 * another request, another instance — is refused while the first holds it.
 */
describe.runIf(integrationEnabled)('acquireAdvisoryLock', () => {
  beforeAll(async () => {
    ({ acquireAdvisoryLock } = await import('@/infra/db/advisoryLock'));
  });

  afterAll(async () => {
    const { prisma } = await import('@/infra/db/prisma');
    await prisma.$disconnect();
  });

  it('lets exactly one holder in until it releases', async () => {
    const first = await acquireAdvisoryLock(TEST_KEY);
    expect(first).not.toBeNull();

    expect(await acquireAdvisoryLock(TEST_KEY)).toBeNull();

    await first!.release();

    const second = await acquireAdvisoryLock(TEST_KEY);
    expect(second).not.toBeNull();
    await second!.release();
  });

  it('sees a lock held by another connection (the other instance case)', async () => {
    const other = new Client({ connectionString: process.env.DATABASE_URL });
    await other.connect();

    try {
      const { rows } = await other.query<{ locked: boolean }>(
        'select pg_try_advisory_lock($1) as locked',
        [TEST_KEY],
      );
      expect(rows[0]?.locked).toBe(true);

      expect(await acquireAdvisoryLock(TEST_KEY)).toBeNull();
    } finally {
      await other.end();
    }

    const afterClose = await acquireAdvisoryLock(TEST_KEY);
    expect(afterClose).not.toBeNull();
    await afterClose!.release();
  });

  it('releases twice without throwing', async () => {
    const lock = await acquireAdvisoryLock(TEST_KEY);
    expect(lock).not.toBeNull();

    await lock!.release();
    await expect(lock!.release()).resolves.toBeUndefined();
  });
});
