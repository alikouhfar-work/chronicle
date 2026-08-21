import { prisma } from '@/lib/prisma';
import { tmdbFetch } from '@/utils/tmdbFetch';
import { TrackedMovieDetailsRaw } from '@/features/movie/types/trackedMovie';

export const addMovie = async (tmdbId: number) => {
  try {
    const existing = await prisma.movie.findUnique({
      where: {
        tmdbId,
      },
      include: {
        tracking: true,
      },
    });

    if (existing) return;

    const movie = await tmdbFetch<TrackedMovieDetailsRaw>(`movie/${tmdbId}`);

    return await prisma.$transaction(async (tx) => {
      return tx.movie.create({
        data: {
          tmdbId: movie.id,
          name: movie.title,
          runtime: movie.runtime,
          overview: movie.overview,
          posterPath: movie.poster_path,
          backdropPath: movie.backdrop_path,
          releaseDate: movie.release_date ? new Date(movie.release_date) : null,
          status: movie.status,
          tagline: movie.tagline,
          lastSyncedAt: new Date(),

          tracking: {
            create: {},
          },

          genres: {
            connectOrCreate: movie.genres.map((genre) => ({
              where: {
                tmdbId: genre.id,
              },
              create: {
                tmdbId: genre.id,
                name: genre.name,
              },
            })),
          },
        },

        include: {
          tracking: true,
          genres: true,
        },
      });
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';

    throw new Error(`Failed to add movie: ${message}`, {
      cause: error,
    });
  }
};
