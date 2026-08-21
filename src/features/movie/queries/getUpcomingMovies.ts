import { addDays } from 'date-fns';
import { prisma } from '@/lib/prisma';
import { GetUpcomingMediaOptions } from '@/features/library/types/getUpcomingMedia';

export const getUpcomingMovies = async (options: GetUpcomingMediaOptions = {}) => {
  const { days = 90 } = options;

  const now = new Date();
  const futureDate = addDays(now, days);

  return prisma.movie.findMany({
    where: {
      releaseDate: {
        gt: now,
        lte: futureDate,
      },
      tracking: {
        status: 'PLAN_TO_WATCH',
      },
    },
    include: {
      tracking: true,
    },
    orderBy: {
      releaseDate: 'asc',
    },
  });
};
