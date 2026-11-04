// @vitest-environment node

import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import type { Prisma } from '../../../generated/prisma/client';

const integrationEnabled = process.env.INTEGRATION_DB === '1';

// Load the DB-backed modules only when the integration suite actually runs.
// The default `npm test` pass must not require a DATABASE_URL.
let prisma!: typeof import('@/infra/db/prisma').prisma;
let recordRewatch!: typeof import('@/modules/rewatch/services/rewatchService').recordRewatch;
let removeRewatchLog!: typeof import('@/modules/rewatch/services/rewatchService').removeRewatchLog;
let getRewatchHistory!: typeof import('@/modules/rewatch/services/rewatchService').getRewatchHistory;
let clearEpisodeWatchHistory!: typeof import('@/modules/rewatch/services/rewatchService').clearEpisodeWatchHistory;
let clearMovieWatchHistory!: typeof import('@/modules/rewatch/services/rewatchService').clearMovieWatchHistory;

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

const daysFromNow = (days: number) => {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + days);
  return date;
};

const clearDatabase = async () => {
  await prisma.rewatchLog.deleteMany();
  await prisma.episodeTracking.deleteMany();
  await prisma.showTracking.deleteMany();
  await prisma.movieTracking.deleteMany();
  await prisma.show.deleteMany();
  await prisma.movie.deleteMany();
  await prisma.episode.deleteMany();
  await prisma.season.deleteMany();
  await prisma.user.deleteMany();
};

const createFixtures = async () => {
  const user = await prisma.user.create({
    data: { email: 'rewatch-integration@chronicle.local', name: 'Rewatch User' },
  });
  const otherUser = await prisma.user.create({
    data: { email: 'rewatch-other@chronicle.local', name: 'Other User' },
  });

  const show = await prisma.show.create({
    data: {
      tmdbId: 700001,
      userId: user.id,
      name: 'Rewatch Show',
      overview: 'Rewatch integration fixture',
      status: 'Ended',
      numberOfSeasons: 2,
      numberOfEpisodes: 4,
      inProduction: false,
      tracking: { create: { status: 'COMPLETED' } },
      seasons: {
        create: [
          {
            tmdbId: 710001,
            seasonNumber: 1,
            name: 'Season 1',
            episodeCount: 3,
            airDate: daysFromNow(-30),
            episodes: {
              create: [
                {
                  tmdbId: 720001,
                  episodeNumber: 1,
                  name: 'S1E1',
                  overview: 'First',
                  airDate: daysFromNow(-20),
                },
                {
                  tmdbId: 720002,
                  episodeNumber: 2,
                  name: 'S1E2',
                  overview: 'Second',
                  airDate: daysFromNow(-10),
                },
                {
                  // Unaired episode: cascade logs/counters include it, but it
                  // must not be marked watched.
                  tmdbId: 720003,
                  episodeNumber: 3,
                  name: 'S1E3',
                  overview: 'Future',
                  airDate: daysFromNow(10),
                },
              ],
            },
          },
          {
            tmdbId: 710002,
            seasonNumber: 2,
            name: 'Season 2',
            episodeCount: 1,
            airDate: daysFromNow(-5),
            episodes: {
              create: [
                {
                  tmdbId: 720004,
                  episodeNumber: 1,
                  name: 'S2E1',
                  overview: 'Finale',
                  airDate: daysFromNow(-4),
                },
              ],
            },
          },
        ],
      },
    },
    include: {
      seasons: {
        include: { episodes: true },
        orderBy: { seasonNumber: 'asc' },
      },
    },
  });

  const movie = await prisma.movie.create({
    data: {
      tmdbId: 730001,
      userId: user.id,
      name: 'Rewatch Movie',
      overview: 'Movie fixture',
      status: 'Released',
      runtime: 100,
      tracking: { create: { status: 'WATCHING' } },
    },
  });

  const [seasonOne, seasonTwo] = show.seasons;
  const [s1e1, s1e2, s1e3] = seasonOne.episodes;
  const [s2e1] = seasonTwo.episodes;

  const otherShow = await prisma.show.create({
    data: {
      tmdbId: 700002,
      userId: otherUser.id,
      name: 'Other Show',
      overview: 'Other user fixture',
      status: 'Ended',
      numberOfSeasons: 1,
      numberOfEpisodes: 1,
      inProduction: false,
      seasons: {
        create: {
          tmdbId: 710101,
          seasonNumber: 1,
          name: 'Season 1',
          episodeCount: 1,
          episodes: {
            create: {
              tmdbId: 720101,
              episodeNumber: 1,
              name: 'Other S1E1',
              overview: 'Other',
              airDate: daysFromNow(-1),
            },
          },
        },
      },
    },
    include: { seasons: { include: { episodes: true } } },
  });

  return {
    user,
    otherUser,
    show,
    movie,
    seasonOne,
    seasonTwo,
    episodes: { s1e1, s1e2, s1e3, s2e1 },
    otherEpisode: otherShow.seasons[0].episodes[0],
  };
};

const countEpisodes = async (where: Prisma.EpisodeWhereInput) => {
  const episodes = await prisma.episode.findMany({
    where,
    select: { rewatchCount: true, tracking: { select: { watched: true } } },
  });
  return episodes;
};

describe.runIf(integrationEnabled)('rewatch tracking integration', () => {
  let fixtures: Awaited<ReturnType<typeof createFixtures>>;

  beforeAll(async () => {
    ({ prisma } = await import('@/infra/db/prisma'));
    ({
      recordRewatch,
      removeRewatchLog,
      getRewatchHistory,
      clearEpisodeWatchHistory,
      clearMovieWatchHistory,
    } = await import('@/modules/rewatch/services/rewatchService'));
  });

  beforeEach(async () => {
    await clearDatabase();
    fixtures = await createFixtures();
  });

  afterAll(async () => {
    await clearDatabase();
    await prisma.$disconnect();
  });

  it('records an episode rewatch with a custom date and marks it watched', async () => {
    const rewatchedAt = new Date('2025-01-02T20:00:00.000Z');
    const result = await recordRewatch({
      userId: fixtures.user.id,
      mediaType: 'episode',
      mediaId: fixtures.episodes.s1e1.id,
      rewatchedAt,
    });

    expect(result.rewatchCount).toBe(1);
    const episode = await prisma.episode.findUniqueOrThrow({
      where: { id: fixtures.episodes.s1e1.id },
      include: { tracking: true },
    });
    expect(episode.rewatchCount).toBe(1);
    expect(episode.tracking?.watched).toBe(true);

    const logs = await prisma.rewatchLog.findMany();
    expect(logs).toHaveLength(1);
    expect(logs[0]).toMatchObject({
      userId: fixtures.user.id,
      mediaType: 'EPISODE',
      mediaId: fixtures.episodes.s1e1.id,
      episodeId: fixtures.episodes.s1e1.id,
    });
    expect(logs[0]?.rewatchedAt.toISOString()).toBe(rewatchedAt.toISOString());

    const history = await getRewatchHistory({
      userId: fixtures.user.id,
      mediaType: 'episode',
      mediaId: fixtures.episodes.s1e1.id,
    });
    expect(history.rewatchCount).toBe(1);
    expect(history.history).toHaveLength(1);
  });

  it('cascades a season rewatch to every episode log and counter', async () => {
    const result = await recordRewatch({
      userId: fixtures.user.id,
      mediaType: 'season',
      mediaId: fixtures.seasonOne.id,
    });

    // Season counters are derived from episodes: one pass leaves every episode
    // below the 4-watch baseline, so the season itself has not been rewatched.
    expect(result.rewatchCount).toBe(0);
    const season = await prisma.season.findUniqueOrThrow({
      where: { id: fixtures.seasonOne.id },
    });
    expect(season.rewatchCount).toBe(0);
    const episodes = await countEpisodes({
      seasonId: fixtures.seasonOne.id,
    });
    expect(episodes.map((episode) => episode.rewatchCount)).toEqual([1, 1, 1]);
    expect(episodes.map((episode) => episode.tracking?.watched)).toEqual([
      true,
      true,
      undefined,
    ]);
    expect(
      await prisma.rewatchLog.count({ where: { userId: fixtures.user.id } }),
    ).toBe(4);
  });

  it('cascades a show rewatch through seasons and episodes', async () => {
    await recordRewatch({
      userId: fixtures.user.id,
      mediaType: 'show',
      mediaId: fixtures.show.id,
    });

    const show = await prisma.show.findUniqueOrThrow({ where: { id: fixtures.show.id } });
    expect(show.rewatchCount).toBe(1);

    const seasons = await prisma.season.findMany({
      where: { showId: fixtures.show.id },
      orderBy: { seasonNumber: 'asc' },
    });
    // One pass is below the season baseline, so every season stays at 0.
    expect(seasons.map((season) => season.rewatchCount)).toEqual([0, 0]);

    const episodes = await countEpisodes({ season: { showId: fixtures.show.id } });
    expect(episodes).toHaveLength(4);
    expect(episodes.every((episode) => episode.rewatchCount === 1)).toBe(true);

    // 1 show + 2 seasons + 4 episodes
    expect(
      await prisma.rewatchLog.count({ where: { userId: fixtures.user.id } }),
    ).toBe(7);
    expect(
      (await prisma.showTracking.findUniqueOrThrow({ where: { showId: fixtures.show.id } }))
        .status,
    ).toBe('COMPLETED');
  });

  it('derives the season rewatch count from the episode rule', async () => {
    // Dedicated all-aired season: the shared Season 1 fixture contains an
    // unaired episode, which can never satisfy "every episode >= 4".
    const season = await prisma.season.create({
      data: {
        tmdbId: 740001,
        seasonNumber: 9,
        name: 'Season 9',
        episodeCount: 3,
        airDate: daysFromNow(-60),
        showId: fixtures.show.id,
        episodes: {
          create: [
            { tmdbId: 750001, episodeNumber: 1, name: 'S9E1', overview: 'A', airDate: daysFromNow(-50) },
            { tmdbId: 750002, episodeNumber: 2, name: 'S9E2', overview: 'B', airDate: daysFromNow(-49) },
            { tmdbId: 750003, episodeNumber: 3, name: 'S9E3', overview: 'C', airDate: daysFromNow(-48) },
          ],
        },
      },
      include: { episodes: { orderBy: { episodeNumber: 'asc' } } },
    });

    const [first, second, third] = season.episodes;
    const rewatchEpisode = async (episodeId: string, times: number) => {
      let count = 0;
      for (let index = 0; index < times; index += 1) {
        const result = await recordRewatch({
          userId: fixtures.user.id,
          mediaType: 'episode',
          mediaId: episodeId,
        });
        count = result.rewatchCount;
      }
      return count;
    };
    const seasonCount = async () =>
      (await prisma.season.findUniqueOrThrow({ where: { id: season.id } })).rewatchCount;

    // Three rewatches each => 4 total watches per episode (1 + 3).
    expect(await rewatchEpisode(first!.id, 3)).toBe(3);
    await rewatchEpisode(second!.id, 3);
    await rewatchEpisode(third!.id, 3);

    // Baseline met everywhere, but no episode reached 5 watches yet.
    expect(await seasonCount()).toBe(0);

    // One deep episode is not enough.
    await rewatchEpisode(first!.id, 1);
    expect(await seasonCount()).toBe(0);

    // Two deep episodes with the laggard on exactly 4 => one season rewatch.
    await rewatchEpisode(second!.id, 1);
    expect(await seasonCount()).toBe(1);

    // Every episode now on 5 watches => a second complete pass.
    await rewatchEpisode(third!.id, 1);
    expect(await seasonCount()).toBe(2);

    // A single episode running ahead does not inflate the count.
    await rewatchEpisode(first!.id, 2);
    expect(await seasonCount()).toBe(2);
  });

  it('removes a single log and decrements its counter', async () => {
    const first = await recordRewatch({
      userId: fixtures.user.id,
      mediaType: 'episode',
      mediaId: fixtures.episodes.s1e2.id,
      rewatchedAt: new Date('2024-01-01T00:00:00.000Z'),
    });
    await recordRewatch({
      userId: fixtures.user.id,
      mediaType: 'episode',
      mediaId: fixtures.episodes.s1e2.id,
      rewatchedAt: new Date('2024-02-01T00:00:00.000Z'),
    });

    const result = await removeRewatchLog({
      userId: fixtures.user.id,
      logId: first.logId,
    });
    expect(result.rewatchCount).toBe(1);

    const episode = await prisma.episode.findUniqueOrThrow({
      where: { id: fixtures.episodes.s1e2.id },
    });
    expect(episode.rewatchCount).toBe(1);
    expect(await prisma.rewatchLog.count()).toBe(1);
  });

  it('unmarks an episode when its last watch log is removed', async () => {
    const { logId } = await recordRewatch({
      userId: fixtures.user.id,
      mediaType: 'episode',
      mediaId: fixtures.episodes.s1e1.id,
    });

    await prisma.episodeTracking.update({
      where: { episodeId: fixtures.episodes.s1e1.id },
      // Notes are a separate table now; the assertion only cares about rating.
      data: { rating: 4 },
    });

    const result = await removeRewatchLog({
      userId: fixtures.user.id,
      logId,
    });

    expect(result.rewatchCount).toBe(0);
    const episode = await prisma.episode.findUniqueOrThrow({
      where: { id: fixtures.episodes.s1e1.id },
      include: { tracking: true },
    });
    expect(episode.rewatchCount).toBe(0);
    expect(episode.tracking).toMatchObject({
      watched: false,
      watchedAt: null,
      rating: 4,
    });
  });

  it('clears every episode watch, its history, and its watched state', async () => {
    await recordRewatch({
      userId: fixtures.user.id,
      mediaType: 'episode',
      mediaId: fixtures.episodes.s1e2.id,
      rewatchedAt: new Date('2024-01-01T00:00:00.000Z'),
    });
    await recordRewatch({
      userId: fixtures.user.id,
      mediaType: 'episode',
      mediaId: fixtures.episodes.s1e2.id,
      rewatchedAt: new Date('2024-02-01T00:00:00.000Z'),
    });

    await prisma.episodeTracking.update({
      where: { episodeId: fixtures.episodes.s1e2.id },
      data: { rating: 3 },
    });

    const result = await clearEpisodeWatchHistory({
      userId: fixtures.user.id,
      mediaId: fixtures.episodes.s1e2.id,
    });

    expect(result.rewatchCount).toBe(0);
    const episode = await prisma.episode.findUniqueOrThrow({
      where: { id: fixtures.episodes.s1e2.id },
      include: { tracking: true },
    });
    expect(episode.rewatchCount).toBe(0);
    expect(episode.tracking).toMatchObject({
      watched: false,
      watchedAt: null,
      rating: 3,
    });
    expect(
      await prisma.rewatchLog.count({
        where: { mediaType: 'EPISODE', mediaId: fixtures.episodes.s1e2.id },
      }),
    ).toBe(0);
    expect(
      (await prisma.showTracking.findUniqueOrThrow({ where: { showId: fixtures.show.id } }))
        .status,
    ).toBe('PLAN_TO_WATCH');
  });

  it('tracks movie rewatches and completes the movie', async () => {
    const result = await recordRewatch({
      userId: fixtures.user.id,
      mediaType: 'movie',
      mediaId: fixtures.movie.id,
    });

    expect(result.rewatchCount).toBe(1);
    const movie = await prisma.movie.findUniqueOrThrow({
      where: { id: fixtures.movie.id },
      include: { tracking: true },
    });
    expect(movie.rewatchCount).toBe(1);
    expect(movie.tracking?.status).toBe('COMPLETED');
  });

  it('clears every movie watch and keeps the rating', async () => {
    await recordRewatch({
      userId: fixtures.user.id,
      mediaType: 'movie',
      mediaId: fixtures.movie.id,
      rewatchedAt: new Date('2024-03-01T00:00:00.000Z'),
    });
    await recordRewatch({
      userId: fixtures.user.id,
      mediaType: 'movie',
      mediaId: fixtures.movie.id,
      rewatchedAt: new Date('2024-04-01T00:00:00.000Z'),
    });

    await prisma.movieTracking.update({
      where: { movieId: fixtures.movie.id },
      data: { rating: 5 },
    });

    const result = await clearMovieWatchHistory({
      userId: fixtures.user.id,
      mediaId: fixtures.movie.id,
    });

    expect(result.rewatchCount).toBe(0);
    expect(result.tmdbId).toBe(fixtures.movie.tmdbId);

    const movie = await prisma.movie.findUniqueOrThrow({
      where: { id: fixtures.movie.id },
      include: { tracking: true },
    });
    expect(movie.rewatchCount).toBe(0);
    // Unwatching clears the completed state but never the rating.
    expect(movie.tracking).toMatchObject({
      status: 'PLAN_TO_WATCH',
      rating: 5,
      startedAt: null,
      completedAt: null,
    });
    expect(
      await prisma.rewatchLog.count({
        where: { mediaType: 'MOVIE', mediaId: fixtures.movie.id },
      }),
    ).toBe(0);
  });

  it('keeps a watching movie in its status when watches are cleared', async () => {
    await recordRewatch({
      userId: fixtures.user.id,
      mediaType: 'movie',
      mediaId: fixtures.movie.id,
    });
    await prisma.movieTracking.update({
      where: { movieId: fixtures.movie.id },
      data: { status: 'WATCHING' },
    });

    await clearMovieWatchHistory({ userId: fixtures.user.id, mediaId: fixtures.movie.id });

    const movie = await prisma.movie.findUniqueOrThrow({
      where: { id: fixtures.movie.id },
      include: { tracking: true },
    });
    expect(movie.rewatchCount).toBe(0);
    expect(movie.tracking?.status).toBe('WATCHING');
  });

  it('rejects media owned by another user', async () => {
    await expect(
      recordRewatch({
        userId: fixtures.user.id,
        mediaType: 'episode',
        mediaId: fixtures.otherEpisode.id,
      }),
    ).rejects.toThrow(/Episode not found/);
  });
});
