import { addDays } from 'date-fns';
import { prisma } from '@/lib/prisma';
import { GetUpcomingMediaOptions } from '@/features/library/types/getUpcomingMedia';

export const getUpcomingEpisodes = async (options: GetUpcomingMediaOptions = {}) => {
  const { days = 30 } = options;

  const now = new Date();
  const futureDate = addDays(now, days);

  return prisma.episode.findMany({
    where: {
      airDate: {
        gt: now,
        lte: futureDate,
      },
      season: {
        seasonNumber: {
          gt: 0,
        },
        show: {
          tracking: {
            status: 'WATCHING',
          },
        },
      },
    },
    include: {
      season: {
        include: {
          show: true,
        },
      },
    },
    orderBy: {
      airDate: 'asc',
    },
  });
};
