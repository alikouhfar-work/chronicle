import { prisma } from '@/lib/prisma';
import { TrackedMovie } from '@/features/movie';

export const getTrackedMovie = async (id: string): Promise<TrackedMovie | null> => {
  return prisma.movie.findUnique({
    where: {
      tmdbId: +id,
    },
    include: {
      genres: true,
      tracking: true,
    },
  });
};
