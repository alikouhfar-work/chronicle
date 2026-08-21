import { addDays } from 'date-fns';
import { prisma } from '@/lib/prisma';
import { GetUpcomingMediaOptions } from '@/features/library/types/getUpcomingMedia';
import { mapUpcomingEpisodes } from '@/features/episode/mappers/mapUpcomingEpisodes';

export const getUpcomingEpisodes = async (options: GetUpcomingMediaOptions = {}) => {
  const { days = 40 } = options;

  const now = new Date();
  const futureDate = addDays(now, days);

  // TODO: we need to fresh the data somehow

  const episodes = await prisma.episode.findMany({
    where: {
      airDate: {
        gt: now,
        lte: futureDate,
      },
      season: {
        seasonNumber: {
          gt: 0,
        },
      },
    },
    include: {
      tracking: true,
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

  return mapUpcomingEpisodes(episodes);
};
