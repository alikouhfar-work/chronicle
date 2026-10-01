import { addDays } from 'date-fns';
import { prisma } from '@/infra/db/prisma';
import { GetUpcomingMediaOptions } from '@/modules/library/types/getUpcomingMedia';
import { mapUpcomingMovies } from '@/modules/movie/mappers/mapUpcomingMovies';
import { DatabaseError, NotFoundError, ValidationError } from '@/shared/lib/errors';
import { parseWindowDays } from '@/shared/lib/validate';

export const getUpcomingMovies = async (options: GetUpcomingMediaOptions = {}) => {
  try {
    const days = parseWindowDays(options.days);
    const now = new Date();
    const futureDate = addDays(now, days);

    const movies = await prisma.movie.findMany({
      where: {
        releaseDate: { gt: now, lte: futureDate },
        tracking: { status: 'PLAN_TO_WATCH' },
      },
      include: { tracking: true },
      orderBy: { releaseDate: 'asc' },
    });

    return mapUpcomingMovies(movies);
  } catch (error) {
    if (error instanceof ValidationError || error instanceof NotFoundError) throw error;
    throw new DatabaseError('Failed to load upcoming movies', { cause: error });
  }
};
