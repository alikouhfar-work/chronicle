import { prisma } from '@/lib/prisma';
import { GetTrackedShowsReturn } from '@/features/show/types/getTrackedShows';

export const getTrackedShows = async (): GetTrackedShowsReturn => {
  return prisma.show.findMany({
    include: {
      genres: true,
      tracking: true,
      seasons: {
        orderBy: {
          seasonNumber: 'asc',
        },
        include: {
          episodes: {
            orderBy: {
              episodeNumber: 'asc',
            },
            include: {
              progress: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
};
