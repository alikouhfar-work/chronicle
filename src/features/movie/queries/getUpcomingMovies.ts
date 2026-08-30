import { addDays } from 'date-fns';
import { prisma } from '@/lib/prisma';
import { GetUpcomingMediaOptions } from '@/features/library/types/getUpcomingMedia';
import { mapUpcomingMovies } from '@/features/movie/mappers/mapUpcomingMovies';

export const getUpcomingMovies = async (options: GetUpcomingMediaOptions = {}) => {
  const { days = 30 } = options;

  const now = new Date();
  const futureDate = addDays(now, days);

  const movies = await prisma.movie.findMany({
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

  return mapUpcomingMovies(movies);
};
