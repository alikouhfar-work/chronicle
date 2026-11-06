// @vitest-environment node

import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import {
  clearRewatchDatabase,
  createRewatchFixtures,
} from '@/modules/rewatch/__fixtures__/rewatchFixture';

const integrationEnabled = process.env.INTEGRATION_DB === '1';

let prisma!: typeof import('@/infra/db/prisma').prisma;
let recordRewatch!: typeof import('@/modules/rewatch/services/rewatchService').recordRewatch;
let reconcileCounters!: typeof import('@/modules/rewatch/services/reconcileCounters').reconcileCounters;

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

describe.runIf(integrationEnabled)('counter reconciliation', () => {
  let fixtures: Awaited<ReturnType<typeof createRewatchFixtures>>;

  beforeAll(async () => {
    ({ prisma } = await import('@/infra/db/prisma'));
    ({ recordRewatch } = await import('@/modules/rewatch/services/rewatchService'));
    ({ reconcileCounters } = await import('@/modules/rewatch/services/reconcileCounters'));
  });

  beforeEach(async () => {
    await clearRewatchDatabase(prisma);
    fixtures = await createRewatchFixtures(prisma);
  });

  afterAll(async () => {
    await clearRewatchDatabase(prisma);
    await prisma.$disconnect();
  });

  it('reports drift without touching it, then fixes it on request', async () => {
    await recordRewatch({
      userId: fixtures.user.id,
      mediaType: 'episode',
      mediaId: fixtures.episodes.s1e1.id,
    });
    await recordRewatch({
      userId: fixtures.user.id,
      mediaType: 'episode',
      mediaId: fixtures.episodes.s1e1.id,
    });
    await recordRewatch({
      userId: fixtures.user.id,
      mediaType: 'movie',
      mediaId: fixtures.movie.id,
    });

    // Inject three kinds of drift: an over-counted episode, a season counter
    // that the rule says should be zero, and a movie counter with no logs.
    await prisma.episode.update({
      where: { id: fixtures.episodes.s1e1.id },
      data: { rewatchCount: 7 },
    });
    await prisma.season.update({
      where: { id: fixtures.seasonOne.id },
      data: { rewatchCount: 3 },
    });
    await prisma.movie.update({
      where: { id: fixtures.movie.id },
      data: { rewatchCount: 9 },
    });

    const report = await reconcileCounters({ fix: false });
    const byKind = Object.fromEntries(report.drift.map((entry) => [entry.kind, entry]));

    expect(report.fixed).toBe(0);
    expect(byKind.episode?.expected).toBe(2);
    expect(byKind.episode?.stored).toBe(7);
    expect(byKind.season?.expected).toBe(0);
    expect(byKind.movie?.expected).toBe(1);

    // Report mode must not have written anything.
    expect(
      (await prisma.episode.findUniqueOrThrow({ where: { id: fixtures.episodes.s1e1.id } }))
        .rewatchCount,
    ).toBe(7);

    const fixed = await reconcileCounters({ fix: true });
    expect(fixed.fixed).toBe(report.drift.length);

    const after = await reconcileCounters({ fix: false });
    expect(after.drift).toEqual([]);

    expect(
      (await prisma.episode.findUniqueOrThrow({ where: { id: fixtures.episodes.s1e1.id } }))
        .rewatchCount,
    ).toBe(2);
    expect(
      (await prisma.season.findUniqueOrThrow({ where: { id: fixtures.seasonOne.id } })).rewatchCount,
    ).toBe(0);
    expect((await prisma.movie.findUniqueOrThrow({ where: { id: fixtures.movie.id } })).rewatchCount).toBe(1);
  });

  it('finds no drift on a clean database', async () => {
    await recordRewatch({
      userId: fixtures.user.id,
      mediaType: 'show',
      mediaId: fixtures.show.id,
    });

    const report = await reconcileCounters({ fix: false });

    expect(report.drift).toEqual([]);
    expect(report.checked).toBeGreaterThan(0);
  });
});
