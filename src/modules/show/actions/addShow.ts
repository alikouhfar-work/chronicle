import { prisma } from '@/infra/db/prisma';
import { getUserTmdbToken, requireUserId } from '@/infra/tmdb/forUser';
import { tmdbFetchWithToken } from '@/infra/tmdb/client';
import { ShowDetailsRaw } from '@/modules/show/types/showDetails';
import { SeasonRaw } from '@/modules/episode-season';
import { ShowTrackingStatus } from '../../../../generated/prisma/enums';
import { DatabaseError, ExternalServiceError, NotFoundError, ValidationError } from '@/shared/lib/errors';
import { buildTrackingTimestamps } from '@/modules/media/tracking';
import { mapWithConcurrency } from '@/shared/lib/async';

const CHUNK_SIZE = 500;
const SEASON_FETCH_CONCURRENCY = 4;

const parseShowTmdbId = (tmdbId: number): number => {
  if (!Number.isInteger(tmdbId) || tmdbId <= 0) {
    throw new ValidationError(`tmdbId must be a positive integer, got "${tmdbId}"`);
  }
  return tmdbId;
};

export const addShow = async (
  tmdbId: number,
  trackingStatus?: ShowTrackingStatus,
  opts?: { userId?: string },
) => {
  try {
    const id = parseShowTmdbId(tmdbId);

    if (
      trackingStatus !== undefined &&
      !Object.values(ShowTrackingStatus).includes(trackingStatus)
    ) {
      throw new ValidationError(`Invalid show tracking status: ${trackingStatus}`);
    }

    // 1. Check if the show already exists
    const userId = opts?.userId ?? (await requireUserId());
    const token = await getUserTmdbToken(userId);
    const existing = await prisma.show.findUnique({
      where: { userId_tmdbId: { userId, tmdbId: id } },
    });

    if (existing) return existing;

    // 2. Fetch show details
    let showData: ShowDetailsRaw;
    try {
      showData = await tmdbFetchWithToken<ShowDetailsRaw>(token, `tv/${id}`);
    } catch (error) {
      throw new ExternalServiceError('TMDB', `Failed to fetch show ${id}`, { cause: error });
    }

    // 3. Fetch all seasons before touching the database
    const seasonNumbers = showData.seasons.map((s) => s.season_number);
    let seasons: SeasonRaw[];
    try {
      seasons = await mapWithConcurrency(seasonNumbers, SEASON_FETCH_CONCURRENCY, (n) =>
        tmdbFetchWithToken<SeasonRaw>(token, `tv/${id}/season/${n}`),
      );
    } catch (error) {
      throw new ExternalServiceError('TMDB', `Failed to fetch seasons for show ${id}`, {
        cause: error,
      });
    }

    // 4. Prepare tracking dates
    const now = new Date();

    const trackingData =
      trackingStatus === undefined
        ? {}
        : { status: trackingStatus, ...buildTrackingTimestamps(trackingStatus, null, now) };

    // 5. Create the show + seasons + tracking in one (small) transaction.
    //    Episodes are intentionally NOT in here — see step 7.
    const { show, seasonIdByNumber } = await prisma.$transaction(
      async (tx) => {
        const show = await tx.show.create({
          data: {
            tmdbId: showData.id,
            userId,
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
        throw new NotFoundError(`Could not find database season ${season.season_number}`);
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
    if (
      error instanceof ValidationError ||
      error instanceof NotFoundError ||
      error instanceof ExternalServiceError
    ) {
      throw error;
    }
    throw new DatabaseError(`Failed to add show ${tmdbId}`, { cause: error });
  }
};
