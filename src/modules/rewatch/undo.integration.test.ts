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

type Prisma = typeof import('@/infra/db/prisma').prisma;
type Service = typeof import('@/modules/rewatch/services/rewatchService');

let prisma!: Prisma;
let recordRewatch!: Service['recordRewatch'];
let removeRewatchLog!: Service['removeRewatchLog'];
let clearEpisodeWatchHistory!: Service['clearEpisodeWatchHistory'];
let clearSeasonWatchHistory!: Service['clearSeasonWatchHistory'];
let clearShowWatchHistory!: Service['clearShowWatchHistory'];
let clearMovieWatchHistory!: Service['clearMovieWatchHistory'];
let restoreWatchRemoval!: Service['restoreWatchRemoval'];
let purgeExpiredRemovals!: Service['purgeExpiredRemovals'];

/**
 * State as the database holds it, ordered so a deep comparison is meaningful.
 * The undo is only correct if this is identical before and after it — counters
 * and tracking timestamps included, which a re-derivation would not reproduce.
 */
const readLogs = async (userId: string) =>
  prisma.rewatchLog.findMany({
    where: { userId },
    orderBy: [{ rewatchedAt: 'asc' }, { id: 'asc' }],
    select: {
      id: true,
      mediaType: true,
      mediaId: true,
      rewatchedAt: true,
      groupId: true,
      clientRequestId: true,
      showId: true,
      seasonId: true,
      episodeId: true,
      movieId: true,
    },
  });

const readEpisodeState = async (seasonId: string) =>
  prisma.episode.findMany({
    where: { seasonId },
    orderBy: { episodeNumber: 'asc' },
    select: {
      id: true,
      rewatchCount: true,
      tracking: { select: { watched: true, watchedAt: true } },
    },
  });

const readShowState = async (showId: string) => ({
  show: await prisma.show.findUnique({
    where: { id: showId },
    select: { rewatchCount: true },
  }),
  seasons: await prisma.season.findMany({
    where: { showId },
    orderBy: { seasonNumber: 'asc' },
    select: { id: true, rewatchCount: true },
  }),
  tracking: await prisma.showTracking.findUnique({
    where: { showId },
    select: { status: true, startedAt: true, completedAt: true },
  }),
});

const readMovieState = async (movieId: string) => ({
  movie: await prisma.movie.findUnique({
    where: { id: movieId },
    select: { rewatchCount: true },
  }),
  tracking: await prisma.movieTracking.findUnique({
    where: { movieId },
    select: { status: true, startedAt: true, completedAt: true },
  }),
});

describe.runIf(integrationEnabled)('watch removal undo', () => {
  let fixtures: Awaited<ReturnType<typeof createRewatchFixtures>>;
  const userId = () => fixtures.user.id;

  beforeAll(async () => {
    ({ prisma } = await import('@/infra/db/prisma'));
    ({
      recordRewatch,
      removeRewatchLog,
      clearEpisodeWatchHistory,
      clearSeasonWatchHistory,
      clearShowWatchHistory,
      clearMovieWatchHistory,
      restoreWatchRemoval,
      purgeExpiredRemovals,
    } = await import('@/modules/rewatch/services/rewatchService'));
  });

  beforeEach(async () => {
    await clearRewatchDatabase(prisma);
    fixtures = await createRewatchFixtures(prisma);
  });

  afterAll(async () => {
    await clearRewatchDatabase(prisma);
    await prisma.$disconnect();
  });

  it('restores a movie unwatch byte-for-byte, timestamps included', async () => {
    const { movie } = fixtures;
    const startedAt = new Date('2024-03-01T10:00:00.000Z');
    const completedAt = new Date('2024-03-02T10:00:00.000Z');

    await prisma.movieTracking.update({
      where: { movieId: movie.id },
      data: { status: 'COMPLETED', startedAt, completedAt },
    });

    await recordRewatch({
      userId: userId(),
      mediaType: 'movie',
      mediaId: movie.id,
      rewatchedAt: new Date('2024-03-03T10:00:00.000Z'),
    });
    await recordRewatch({
      userId: userId(),
      mediaType: 'movie',
      mediaId: movie.id,
      rewatchedAt: new Date('2024-03-04T10:00:00.000Z'),
    });

    const logsBefore = await readLogs(userId());
    const stateBefore = await readMovieState(movie.id);

    const removal = await clearMovieWatchHistory({ userId: userId(), mediaId: movie.id });

    expect(removal.removedLogs).toBe(2);
    expect(await readLogs(userId())).toHaveLength(0);
    expect((await readMovieState(movie.id)).tracking).toMatchObject({ status: 'PLAN_TO_WATCH' });

    const restored = await restoreWatchRemoval({ userId: userId(), removalId: removal.undoToken });

    expect(restored.rewatchCount).toBe(2);
    expect(await readLogs(userId())).toEqual(logsBefore);
    expect(await readMovieState(movie.id)).toEqual(stateBefore);
  });

  it('restores an episode unwatch including the watched flag and both counters', async () => {
    const { episodes, seasonOne, show } = fixtures;

    await recordRewatch({
      userId: userId(),
      mediaType: 'episode',
      mediaId: episodes.s1e1.id,
      rewatchedAt: new Date('2024-04-01T10:00:00.000Z'),
    });
    await recordRewatch({
      userId: userId(),
      mediaType: 'episode',
      mediaId: episodes.s1e1.id,
      rewatchedAt: new Date('2024-04-02T10:00:00.000Z'),
    });

    const logsBefore = await readLogs(userId());
    const episodesBefore = await readEpisodeState(seasonOne.id);
    const showBefore = await readShowState(show.id);

    const removal = await clearEpisodeWatchHistory({ userId: userId(), mediaId: episodes.s1e1.id });

    expect(removal.removedLogs).toBe(2);
    expect((await readEpisodeState(seasonOne.id))[0].tracking?.watched).toBe(false);

    await restoreWatchRemoval({ userId: userId(), removalId: removal.undoToken });

    expect(await readLogs(userId())).toEqual(logsBefore);
    expect(await readEpisodeState(seasonOne.id)).toEqual(episodesBefore);
    expect(await readShowState(show.id)).toEqual(showBefore);
  });

  it('restores a season unwatch with its cascaded episode logs', async () => {
    const { seasonOne, show } = fixtures;

    await recordRewatch({ userId: userId(), mediaType: 'season', mediaId: seasonOne.id });
    await recordRewatch({ userId: userId(), mediaType: 'season', mediaId: seasonOne.id });

    const logsBefore = await readLogs(userId());
    const episodesBefore = await readEpisodeState(seasonOne.id);
    const showBefore = await readShowState(show.id);

    // Every episode of the season plus the season row itself.
    const removal = await clearSeasonWatchHistory({ userId: userId(), mediaId: seasonOne.id });
    expect(removal.removedLogs).toBe(8);

    await restoreWatchRemoval({ userId: userId(), removalId: removal.undoToken });

    expect(await readLogs(userId())).toEqual(logsBefore);
    expect(await readEpisodeState(seasonOne.id)).toEqual(episodesBefore);
    expect(await readShowState(show.id)).toEqual(showBefore);
  });

  it('restores a show unwatch, including a tracking row the unwatch changed', async () => {
    const { show } = fixtures;

    await recordRewatch({ userId: userId(), mediaType: 'show', mediaId: show.id });
    await recordRewatch({ userId: userId(), mediaType: 'show', mediaId: show.id });
    await recordRewatch({ userId: userId(), mediaType: 'show', mediaId: show.id });

    const logsBefore = await readLogs(userId());
    const showBefore = await readShowState(show.id);
    const episodesBefore = new Map<string, Awaited<ReturnType<typeof readEpisodeState>>>();
    for (const season of await prisma.season.findMany({
      where: { showId: show.id },
      select: { id: true },
    })) {
      episodesBefore.set(season.id, await readEpisodeState(season.id));
    }

    expect(showBefore.tracking?.status).toBe('COMPLETED');

    const removal = await clearShowWatchHistory({ userId: userId(), mediaId: show.id });

    expect(removal.removedLogs).toBeGreaterThan(9);
    expect((await readShowState(show.id)).tracking).toMatchObject({ status: 'PLAN_TO_WATCH' });

    await restoreWatchRemoval({ userId: userId(), removalId: removal.undoToken });

    expect(await readLogs(userId())).toEqual(logsBefore);
    expect(await readShowState(show.id)).toEqual(showBefore);

    for (const [seasonId, stateBefore] of episodesBefore) {
      expect(await readEpisodeState(seasonId)).toEqual(stateBefore);
    }
  });

  it('restores one log removed from the history without touching the rest of the batch', async () => {
    const { seasonOne, show } = fixtures;

    await recordRewatch({ userId: userId(), mediaType: 'season', mediaId: seasonOne.id });

    const logsBefore = await readLogs(userId());
    const showBefore = await readShowState(show.id);
    // A season row inside a batch is a child: removing it must not take the batch.
    const child = logsBefore.find((log) => log.mediaType === 'EPISODE' && log.seasonId === seasonOne.id);
    expect(child).toBeDefined();

    const removal = await removeRewatchLog({ userId: userId(), logId: child!.id });

    expect(removal.removedLogs).toBe(1);
    expect(await readLogs(userId())).toHaveLength(logsBefore.length - 1);

    await restoreWatchRemoval({ userId: userId(), removalId: removal.undoToken });

    expect(await readLogs(userId())).toEqual(logsBefore);
    expect(await readShowState(show.id)).toEqual(showBefore);
  });

  it('refuses to undo twice — the snapshot is single use', async () => {
    const { movie } = fixtures;
    await recordRewatch({ userId: userId(), mediaType: 'movie', mediaId: movie.id });

    const removal = await clearMovieWatchHistory({ userId: userId(), mediaId: movie.id });
    await restoreWatchRemoval({ userId: userId(), removalId: removal.undoToken });

    await expect(
      restoreWatchRemoval({ userId: userId(), removalId: removal.undoToken }),
    ).rejects.toThrow(/not found/i);
  });

  it('refuses an undo past the window', async () => {
    const { movie } = fixtures;
    await recordRewatch({ userId: userId(), mediaType: 'movie', mediaId: movie.id });

    const removal = await clearMovieWatchHistory({ userId: userId(), mediaId: movie.id });

    await prisma.rewatchLogRemoval.update({
      where: { id: removal.undoToken },
      data: { createdAt: new Date(Date.now() - 11 * 60 * 1000) },
    });

    await expect(
      restoreWatchRemoval({ userId: userId(), removalId: removal.undoToken }),
    ).rejects.toThrow(/undo window/i);

    // The rows stay removed: a closed window is not a silent restore.
    expect(await readLogs(userId())).toHaveLength(0);
  });

  it('treats another account’s removal id as missing', async () => {
    const { movie } = fixtures;
    await recordRewatch({ userId: userId(), mediaType: 'movie', mediaId: movie.id });

    const removal = await clearMovieWatchHistory({ userId: userId(), mediaId: movie.id });

    await expect(
      restoreWatchRemoval({ userId: fixtures.otherUser.id, removalId: removal.undoToken }),
    ).rejects.toThrow(/not found/i);

    expect(await readLogs(fixtures.otherUser.id)).toHaveLength(0);
  });

  it('refuses when a new watch landed on the same title after the unwatch', async () => {
    const { movie } = fixtures;
    await recordRewatch({ userId: userId(), mediaType: 'movie', mediaId: movie.id });

    const removal = await clearMovieWatchHistory({ userId: userId(), mediaId: movie.id });
    await recordRewatch({ userId: userId(), mediaType: 'movie', mediaId: movie.id });

    await expect(
      restoreWatchRemoval({ userId: userId(), removalId: removal.undoToken }),
    ).rejects.toThrow(/can no longer be undone/i);

    // The newer watch is untouched, not merged with the snapshot.
    expect(await readLogs(userId())).toHaveLength(1);
  });

  it('refuses an episode undo once a sibling episode of the same show was watched', async () => {
    const { episodes } = fixtures;

    await recordRewatch({ userId: userId(), mediaType: 'episode', mediaId: episodes.s1e1.id });
    const removal = await clearEpisodeWatchHistory({ userId: userId(), mediaId: episodes.s1e1.id });

    // The snapshot carries the whole show's counters and tracking row, so a
    // watch anywhere in the show makes a verbatim restore unsafe.
    await recordRewatch({ userId: userId(), mediaType: 'episode', mediaId: episodes.s1e2.id });

    await expect(
      restoreWatchRemoval({ userId: userId(), removalId: removal.undoToken }),
    ).rejects.toThrow(/can no longer be undone/i);

    const remaining = await readLogs(userId());
    expect(remaining).toHaveLength(1);
    expect(remaining[0].episodeId).toBe(episodes.s1e2.id);
  });

  it('purges snapshots whose window has closed and keeps live ones', async () => {
    const { movie } = fixtures;
    await recordRewatch({ userId: userId(), mediaType: 'movie', mediaId: movie.id });
    await recordRewatch({ userId: userId(), mediaType: 'movie', mediaId: movie.id });
    await recordRewatch({ userId: userId(), mediaType: 'movie', mediaId: movie.id });

    const live = await removeRewatchLog({
      userId: userId(),
      logId: (await readLogs(userId()))[0].id,
    });
    const expired = await removeRewatchLog({
      userId: userId(),
      logId: (await readLogs(userId()))[0].id,
    });

    await prisma.rewatchLogRemoval.update({
      where: { id: expired.undoToken },
      data: { createdAt: new Date(Date.now() - 11 * 60 * 1000) },
    });

    expect(await purgeExpiredRemovals()).toBe(1);
    expect(await prisma.rewatchLogRemoval.count({ where: { id: live.undoToken } })).toBe(1);
  });

  it('also purges an expired snapshot when the next removal is captured', async () => {
    const { movie } = fixtures;
    await recordRewatch({ userId: userId(), mediaType: 'movie', mediaId: movie.id });
    await recordRewatch({ userId: userId(), mediaType: 'movie', mediaId: movie.id });

    const expired = await removeRewatchLog({
      userId: userId(),
      logId: (await readLogs(userId()))[0].id,
    });
    await prisma.rewatchLogRemoval.update({
      where: { id: expired.undoToken },
      data: { createdAt: new Date(Date.now() - 11 * 60 * 1000) },
    });

    // No cron involved: the next unwatch sweeps the owner's closed windows.
    await clearMovieWatchHistory({ userId: userId(), mediaId: movie.id });

    expect(
      await prisma.rewatchLogRemoval.count({ where: { id: expired.undoToken } }),
    ).toBe(0);
    expect(await prisma.rewatchLogRemoval.count({ where: { userId: userId() } })).toBe(1);
  });
});
