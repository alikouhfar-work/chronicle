import { prisma } from '@/infra/db/prisma';
import { getUserTmdbToken, requireUserId } from '@/infra/tmdb/forUser';
import { tmdbFetchWithToken } from '@/infra/tmdb/client';
import { TrackedMovieDetailsRaw } from '@/modules/movie/types/trackedMovie';
import { MovieTrackingStatus } from '../../../../generated/prisma/enums';
import { DatabaseError, ExternalServiceError, ValidationError } from '@/shared/lib/errors';
import { buildTrackingTimestamps } from '@/modules/media/tracking';

export const addMovie = async (
  tmdbId: number,
  trackingStatus?: MovieTrackingStatus,
  opts?: { userId?: string },
) => {
  try {
    if (!Number.isInteger(tmdbId) || tmdbId <= 0) {
      throw new ValidationError(`tmdbId must be a positive integer, got "${tmdbId}"`);
    }

    if (
      trackingStatus !== undefined &&
      !Object.values(MovieTrackingStatus).includes(trackingStatus)
    ) {
      throw new ValidationError(`Invalid movie tracking status: ${trackingStatus}`);
    }

    const ownerId = opts?.userId ?? (await requireUserId());
    const existing = await prisma.movie.findUnique({
      where: { userId_tmdbId: { userId: ownerId, tmdbId } },
    });

    if (existing) return existing;

    let movie: TrackedMovieDetailsRaw;
    try {
      const token = await getUserTmdbToken(ownerId);
      movie = await tmdbFetchWithToken<TrackedMovieDetailsRaw>(token, `movie/${tmdbId}`);
    } catch (error) {
      throw new ExternalServiceError('TMDB', `Failed to fetch movie ${tmdbId}`, { cause: error });
    }

    const now = new Date();
    const timestamps = trackingStatus
      ? buildTrackingTimestamps(trackingStatus, null, now)
      : { startedAt: null, completedAt: null };

    return await prisma.$transaction(
      async (tx) => {
        return tx.movie.create({
          data: {
            tmdbId: movie.id,
            userId: ownerId,
            name: movie.title,
            runtime: movie.runtime,
            overview: movie.overview,
            posterPath: movie.poster_path,
            backdropPath: movie.backdrop_path,
            releaseDate: movie.release_date ? new Date(movie.release_date) : null,
            status: movie.status,
            tagline: movie.tagline,
            lastSyncedAt: now,

            tracking: {
              create: trackingStatus
                ? { status: trackingStatus, ...timestamps }
                : {},
            },

            genres: {
              connectOrCreate: movie.genres.map((genre) => ({
                where: { tmdbId: genre.id },
                create: { tmdbId: genre.id, name: genre.name },
              })),
            },
          },
          include: {
            tracking: true,
            genres: true,
          },
        });
      },
      { timeout: 10_000, maxWait: 5_000 },
    );
  } catch (error) {
    if (error instanceof ValidationError || error instanceof ExternalServiceError) throw error;
    throw new DatabaseError(`Failed to add movie ${tmdbId}`, { cause: error });
  }
};
