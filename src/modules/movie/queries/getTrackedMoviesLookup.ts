import { prisma } from '@/infra/db/prisma';
import { DatabaseError } from '@/shared/lib/errors';

export const getTrackedMoviesLookup = async (tmdbIds: number[]): Promise<Set<number>> => {
  try {
    if (!Array.isArray(tmdbIds) || tmdbIds.length === 0) return new Set<number>();

    const trackedMovies = await prisma.movie.findMany({
      where: { tmdbId: { in: tmdbIds } },
      select: { tmdbId: true },
    });

    return new Set(trackedMovies.map((movie) => movie.tmdbId));
  } catch (error) {
    throw new DatabaseError('Failed to load tracked movies lookup', { cause: error });
  }
};
