import { addDays } from 'date-fns';
import { prisma } from '@/lib/prisma';
import { GetUpcomingMediaOptions } from '@/features/library/types/getUpcomingMedia';
import { mapUpcomingEpisodes } from '@/features/episode/mappers/mapUpcomingEpisodes';
import { getFreshTrackedShows } from '@/features/show/queries/getFreshTrackedShows';

export const getUpcomingEpisodes = async (options: GetUpcomingMediaOptions = {}) => {
  const { days = 30 } = options;

  await getFreshTrackedShows();
  const now = new Date();
  const futureDate = addDays(now, days);

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
    orderBy: [
      {
        airDate: 'asc',
      },
      {
        episodeNumber: 'asc',
      },
    ],
  });

  return mapUpcomingEpisodes(episodes);
};
