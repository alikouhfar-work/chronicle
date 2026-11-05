// @vitest-environment node

import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import {
  clearRewatchDatabase,
  createRewatchFixtures,
} from '@/modules/rewatch/__fixtures__/rewatchFixture';

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

let prisma!: typeof import('@/infra/db/prisma').prisma;
let recordRewatch!: typeof import('@/modules/rewatch/services/rewatchService').recordRewatch;
let removeRewatchLog!: typeof import('@/modules/rewatch/services/rewatchService').removeRewatchLog;

/**
 * Cascade isolation: deleting one rewatch must never remove a watch the user did
 * not ask to delete. The two `it.fails` cases reproduce the timestamp-identity
 * bug from docs/gap-analysis.md (A1) and must be flipped to `it(...)` by WP-04.
 */
describe.runIf(integrationEnabled)('rewatch cascade isolation', () => {
  let fixtures: Awaited<ReturnType<typeof createRewatchFixtures>>;

  beforeAll(async () => {
    ({ prisma } = await import('@/infra/db/prisma'));
    ({ recordRewatch, removeRewatchLog } = await import('@/modules/rewatch/services/rewatchService'));
  });

  beforeEach(async () => {
    await clearRewatchDatabase(prisma);
    fixtures = await createRewatchFixtures(prisma);
  });

  afterAll(async () => {
    await clearRewatchDatabase(prisma);
    await prisma.$disconnect();
  });

  const logCount = () => prisma.rewatchLog.count({ where: { userId: fixtures.user.id } });

  const seasonLog = async () =>
    prisma.rewatchLog.findFirstOrThrow({
      where: { userId: fixtures.user.id, mediaType: 'SEASON' },
    });

  it('deletes its own batch and nothing else when timestamps differ', async () => {
    await recordRewatch({
      userId: fixtures.user.id,
      mediaType: 'season',
      mediaId: fixtures.seasonOne.id,
      rewatchedAt: new Date('2025-03-01T10:00:00.000Z'),
    });
    // S1E2 logged separately, one second later: a different batch.
    await recordRewatch({
      userId: fixtures.user.id,
      mediaType: 'episode',
      mediaId: fixtures.episodes.s1e2.id,
      rewatchedAt: new Date('2025-03-01T10:00:01.000Z'),
    });

    expect(await logCount()).toBe(5);

    await removeRewatchLog({
      userId: fixtures.user.id,
      logId: (await seasonLog()).id,
    });

    const remaining = await prisma.rewatchLog.findMany({ where: { userId: fixtures.user.id } });
    expect(remaining).toHaveLength(1);
    expect(remaining[0]).toMatchObject({
      mediaType: 'EPISODE',
      mediaId: fixtures.episodes.s1e2.id,
    });
  });

  it('keeps an unrelated episode log written in the same millisecond', async () => {
    const sameInstant = new Date('2025-03-01T10:00:00.000Z');

    await recordRewatch({
      userId: fixtures.user.id,
      mediaType: 'season',
      mediaId: fixtures.seasonOne.id,
      rewatchedAt: sameInstant,
    });
    // A separate watch of S1E2 — different action, same millisecond.
    await recordRewatch({
      userId: fixtures.user.id,
      mediaType: 'episode',
      mediaId: fixtures.episodes.s1e2.id,
      rewatchedAt: sameInstant,
    });

    await removeRewatchLog({
      userId: fixtures.user.id,
      logId: (await seasonLog()).id,
    });

    const remaining = await prisma.rewatchLog.findMany({ where: { userId: fixtures.user.id } });
    // Only the separately logged episode survives; the batch (including its own
    // S1E2 row) is gone.
    expect(remaining).toHaveLength(1);
    expect(remaining[0]).toMatchObject({
      mediaType: 'EPISODE',
      mediaId: fixtures.episodes.s1e2.id,
    });
  });

  it('keeps a sibling batch written in the same millisecond', async () => {
    const sameInstant = new Date('2025-03-01T10:00:00.000Z');

    // Double submit / retry: two identical season rewatches at one instant.
    await recordRewatch({
      userId: fixtures.user.id,
      mediaType: 'season',
      mediaId: fixtures.seasonOne.id,
      rewatchedAt: sameInstant,
    });
    await recordRewatch({
      userId: fixtures.user.id,
      mediaType: 'season',
      mediaId: fixtures.seasonOne.id,
      rewatchedAt: sameInstant,
    });

    expect(await logCount()).toBe(8);

    const [firstBatch] = await prisma.rewatchLog.findMany({
      where: { userId: fixtures.user.id, mediaType: 'SEASON' },
      orderBy: { id: 'asc' },
    });

    await removeRewatchLog({ userId: fixtures.user.id, logId: firstBatch.id });

    // One whole batch (1 season + 3 episodes) must remain.
    expect(await logCount()).toBe(4);
    const episodes = await prisma.episode.findMany({
      where: { seasonId: fixtures.seasonOne.id },
      select: { rewatchCount: true },
    });
    expect(episodes.map((episode) => episode.rewatchCount)).toEqual([1, 1, 1]);
  });

  it('gives every log a group id and batches share it', async () => {
    await recordRewatch({
      userId: fixtures.user.id,
      mediaType: 'season',
      mediaId: fixtures.seasonOne.id,
      rewatchedAt: new Date('2025-03-01T10:00:00.000Z'),
    });
    await recordRewatch({
      userId: fixtures.user.id,
      mediaType: 'movie',
      mediaId: fixtures.movie.id,
      rewatchedAt: new Date('2025-03-01T11:00:00.000Z'),
    });

    const logs = await prisma.rewatchLog.findMany({ where: { userId: fixtures.user.id } });
    expect(logs).toHaveLength(5);
    expect(logs.every((log) => typeof log.groupId === 'string' && log.groupId.length > 0)).toBe(
      true,
    );

    const batch = logs.filter((log) => log.seasonId === fixtures.seasonOne.id);
    const groups = new Set(batch.map((log) => log.groupId));
    expect(groups.size).toBe(1);
    // The season log is the batch id, standalone movie log is its own group.
    const seasonLog = batch.find((log) => log.mediaType === 'SEASON');
    expect(seasonLog?.groupId).toBe(seasonLog?.id);
    const movieLog = logs.find((log) => log.mediaType === 'MOVIE');
    expect(movieLog?.groupId).toBe(movieLog?.id);
  });

  it('removes a single child row without deleting the show batch', async () => {
    await recordRewatch({
      userId: fixtures.user.id,
      mediaType: 'show',
      mediaId: fixtures.show.id,
      rewatchedAt: new Date('2025-03-01T10:00:00.000Z'),
    });

    // 1 show + 2 season + 4 episode logs.
    expect(await logCount()).toBe(7);

    const seasonRow = await prisma.rewatchLog.findFirstOrThrow({
      where: {
        userId: fixtures.user.id,
        mediaType: 'SEASON',
        seasonId: fixtures.seasonOne.id,
      },
    });
    // A season row inside a show batch is a child, not a batch parent.
    expect(seasonRow.groupId).not.toBe(seasonRow.id);

    await removeRewatchLog({ userId: fixtures.user.id, logId: seasonRow.id });

    // Only that row goes; the rest of the show batch survives.
    expect(await logCount()).toBe(6);
    const showLog = await prisma.rewatchLog.findFirstOrThrow({
      where: { userId: fixtures.user.id, mediaType: 'SHOW' },
    });
    expect(showLog.groupId).toBe(showLog.id);
  });

  it('decrements only the episodes of the deleted batch', async () => {
    const first = new Date('2025-03-01T10:00:00.000Z');
    const second = new Date('2025-03-01T11:00:00.000Z');

    await recordRewatch({
      userId: fixtures.user.id,
      mediaType: 'season',
      mediaId: fixtures.seasonOne.id,
      rewatchedAt: first,
    });
    await recordRewatch({
      userId: fixtures.user.id,
      mediaType: 'season',
      mediaId: fixtures.seasonOne.id,
      rewatchedAt: second,
    });

    await removeRewatchLog({
      userId: fixtures.user.id,
      logId: (await seasonLog()).id,
    });

    const episodes = await prisma.episode.findMany({
      where: { seasonId: fixtures.seasonOne.id },
      orderBy: { episodeNumber: 'asc' },
      select: { rewatchCount: true },
    });
    expect(episodes.map((episode) => episode.rewatchCount)).toEqual([1, 1, 1]);
    expect(await logCount()).toBe(4);
  });
});
