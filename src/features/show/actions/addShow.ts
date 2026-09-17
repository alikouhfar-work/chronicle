import { prisma } from '@/lib/prisma';
import { tmdbFetch } from '@/utils/tmdbFetch';
import { ShowDetailsRaw } from '@/features/show/types/show';
import { SeasonRaw } from '@/features/season';
import { ShowTrackingStatus } from '../../../../generated/prisma/enums';

const CHUNK_SIZE = 500;

export const addShow = async (tmdbId: number, trackingStatus?: ShowTrackingStatus) => {
  try {
    // 1. Check if the show already exists
    const existing = await prisma.show.findUnique({
      where: { tmdbId },
    });

    if (existing) return;

    // 2. Fetch show details
    const showData = await tmdbFetch<ShowDetailsRaw>(`tv/${tmdbId}`);

    // 3. Fetch all seasons before touching the database
    const fetchWithConcurrency = async <T>(
      items: number[],
      limit: number,
      fn: (n: number) => Promise<T>,
    ): Promise<T[]> => {
      const results: T[] = new Array(items.length);
      let i = 0;
      const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
        while (true) {
          const idx = i++;
          if (idx >= items.length) break;
          results[idx] = await fn(items[idx]);
        }
      });
      await Promise.all(workers);
      return results;
    };

    const seasonNumbers = showData.seasons.map((s) => s.season_number);
    const seasons = await fetchWithConcurrency(seasonNumbers, 4, (n) =>
      tmdbFetch<SeasonRaw>(`tv/${tmdbId}/season/${n}`),
    );

    // 4. Prepare tracking dates
    const now = new Date();

    const trackingData =
      trackingStatus === undefined
        ? {}
        : {
            status: trackingStatus,
            startedAt:
              trackingStatus === ShowTrackingStatus.WATCHING ||
              trackingStatus === ShowTrackingStatus.COMPLETED
                ? now
                : null,
            completedAt: trackingStatus === ShowTrackingStatus.COMPLETED ? now : null,
          };

    // 5. Create the show + seasons + tracking in one (small) transaction.
    //    Episodes are intentionally NOT in here — see step 7.
    const { show, seasonIdByNumber } = await prisma.$transaction(
      async (tx) => {
        const show = await tx.show.create({
          data: {
            tmdbId: showData.id,
            name: showData.name,
            overview: showData.overview,
            posterPath: showData.poster_path,
            backdropPath: showData.backdrop_path,
            firstAirDate: showData.first_air_date ? new Date(showData.first_air_date) : null,
            lastAirDate: showData.last_air_date ? new Date(showData.last_air_date) : null,
            status: showData.status,
            tagline: showData.tagline,
            numberOfSeasons: showData.number_of_seasons,
            numberOfEpisodes: showData.number_of_episodes,
            inProduction: showData.in_production,
            lastSyncedAt: now,

            tracking: { create: trackingData },

            genres: {
              connectOrCreate: showData.genres.map((genre) => ({
                where: { tmdbId: genre.id },
                create: { tmdbId: genre.id, name: genre.name },
              })),
            },
          },
        });

        // 6. Create seasons in bulk
        await tx.season.createMany({
          data: seasons.map((season) => ({
            showId: show.id,
            tmdbId: season.id,
            name: season.name,
            seasonNumber: season.season_number,
            episodeCount: season.episodes.length,
            airDate: season.air_date ? new Date(season.air_date) : null,
          })),
        });

        const createdSeasons = await tx.season.findMany({
          where: { showId: show.id },
          select: { id: true, seasonNumber: true },
        });

        const seasonIdByNumber = new Map(
          createdSeasons.map((season) => [season.seasonNumber, season.id]),
        );

        return { show, seasonIdByNumber };
      },
      { timeout: 15_000, maxWait: 10_000 },
    );

    // 7. Flatten all episodes (outside the transaction)
    const episodes = seasons.flatMap((season) => {
      const seasonId = seasonIdByNumber.get(season.season_number);

      if (!seasonId) {
        throw new Error(`Could not find database season ${season.season_number}`);
      }

      return season.episodes.map((episode) => ({
        seasonId,
        tmdbId: episode.id,
        episodeNumber: episode.episode_number,
        name: episode.name,
        overview: episode.overview,
        runtime: episode.runtime,
        airDate: episode.air_date ? new Date(episode.air_date) : null,
      }));
    });

    // 8. Create episodes in chunks — no transaction, so no 5s clock.
    for (let i = 0; i < episodes.length; i += CHUNK_SIZE) {
      const chunk = episodes.slice(i, i + CHUNK_SIZE);

      const createdEpisodes = await prisma.episode.createManyAndReturn({
        data: chunk,
        select: { id: true },
      });

      if (trackingStatus === ShowTrackingStatus.COMPLETED) {
        await prisma.episodeTracking.createMany({
          data: createdEpisodes.map((episode) => ({
            episodeId: episode.id,
            watched: true,
            watchedAt: now,
          })),
        });
      }
    }

    // 9. Fetch and return the complete show
    return prisma.show.findUnique({
      where: { id: show.id },
      include: {
        tracking: true,
        genres: true,
        seasons: {
          include: {
            episodes: {
              include: { tracking: true },
            },
          },
        },
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';

    throw new Error(`Failed to add show: ${message}`, { cause: error });
  }
};
