import { prisma } from '@/lib/prisma';

export const getTrackedMoviesLookup = async (tmdbIds: number[]) => {
  const trackedMovies = await prisma.movie.findMany({
    where: {
      tmdbId: {
        in: tmdbIds,
      },
    },
    select: {
      tmdbId: true,
    },
  });

  return new Set(trackedMovies.map((show) => show.tmdbId));
};
