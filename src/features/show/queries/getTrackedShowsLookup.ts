import { prisma } from '@/lib/prisma';

export const getTrackedShowsLookup = async (tmdbIds: number[]) => {
  const trackedShows = await prisma.show.findMany({
    where: {
      tmdbId: {
        in: tmdbIds,
      },
    },
    select: {
      tmdbId: true,
    },
  });

  return new Set(trackedShows.map((show) => show.tmdbId));
};
