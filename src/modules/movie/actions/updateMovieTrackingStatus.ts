'use server';

import { prisma } from '@/infra/db/prisma';
import { MovieTrackingStatus } from '../../../../generated/prisma/enums';
import { DatabaseError, NotFoundError, ValidationError } from '@/shared/lib/errors';
import { parseDbId } from '@/shared/lib/validate';
import { buildTrackingTimestamps } from '@/modules/media/tracking';
import { revalidateMediaDetail } from '@/shared/lib/revalidate';

export const updateMovieTrackingStatus = async (movieId: string, status: MovieTrackingStatus) => {
  try {
    const id = parseDbId(movieId, 'movieId');

    if (!Object.values(MovieTrackingStatus).includes(status)) {
      throw new ValidationError(`Invalid movie tracking status: ${status}`);
    }

    const movie = await prisma.movie.findUnique({
      where: { id },
      select: { id: true, tmdbId: true, tracking: { select: { startedAt: true } } },
    });

    if (!movie) {
      throw new NotFoundError(`Movie not found: ${id}`);
    }

    const timestamps = buildTrackingTimestamps(status, movie.tracking?.startedAt);

    await prisma.movieTracking.upsert({
      where: { movieId: id },
      create: { movieId: id, status, ...timestamps },
      update: { status, ...timestamps },
    });

    revalidateMediaDetail('movie', movie.tmdbId);
  } catch (error) {
    if (error instanceof ValidationError || error instanceof NotFoundError) throw error;
    throw new DatabaseError('Failed to update movie status', { cause: error });
  }
};
