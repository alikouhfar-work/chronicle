import { prisma } from '@/lib/prisma';

export const getTrackedShow = async (id: string) => {
  return prisma.show.findUnique({
    where: {
      tmdbId: +id,
    },
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
  });
};
