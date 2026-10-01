import { prisma } from '@/infra/db/prisma';
import { DatabaseError } from '@/shared/lib/errors';

export const getTrackedShowsLookup = async (tmdbIds: number[]): Promise<Set<number>> => {
  try {
    if (!Array.isArray(tmdbIds) || tmdbIds.length === 0) return new Set<number>();

    const trackedShows = await prisma.show.findMany({
      where: { tmdbId: { in: tmdbIds } },
      select: { tmdbId: true },
    });

    return new Set(trackedShows.map((show) => show.tmdbId));
  } catch (error) {
    throw new DatabaseError('Failed to load tracked shows lookup', { cause: error });
  }
};
