import { prisma } from '@/lib/prisma';
import { TrackedShow } from '@/features/show';

export const getTrackedShow = async (id: string): Promise<TrackedShow | null> => {
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
              tracking: true,
            },
          },
        },
      },
    },
  });
};
