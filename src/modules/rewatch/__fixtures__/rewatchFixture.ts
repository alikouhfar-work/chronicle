// Shared database fixtures for the rewatch integration suites. Everything here
// is intentionally explicit (TMDB ids, air dates) so the derived-counter rules
// can be asserted without depending on the seeded development data.

type Db = typeof import('@/infra/db/prisma').prisma;

export const daysFromNow = (days: number) => {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + days);
  return date;
};

export const clearRewatchDatabase = async (prisma: Db) => {
  await prisma.rewatchLogRemoval.deleteMany();
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

/**
 * Two users, one tracked show (2 seasons / 4 episodes, one unaired), one movie,
 * and one show owned by the second user for ownership-isolation tests.
 */
export const createRewatchFixtures = async (prisma: Db) => {
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
