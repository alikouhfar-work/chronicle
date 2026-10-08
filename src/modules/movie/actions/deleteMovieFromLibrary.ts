'use server';

import { prisma } from '@/infra/db/prisma';
import { requireUserId } from '@/infra/tmdb/forUser';
import { getErrorMessage, NotFoundError } from '@/shared/lib/errors';
import { parseDbId } from '@/shared/lib/validate';
import { revalidateMediaDetail } from '@/shared/lib/revalidate';

export const deleteMovieFromLibrary = async (movieId: string) => {
  try {
    const id = parseDbId(movieId, 'movieId');
    const userId = await requireUserId();

    const movie = await prisma.movie.findUnique({
      where: { id },
      select: { tmdbId: true, userId: true },
    });

    if (!movie || movie.userId !== userId) {
      throw new NotFoundError(`Movie not found: ${id}`);
    }

    await prisma.movie.delete({
      where: {
        id,
      },
    });

    revalidateMediaDetail('movie', movie.tmdbId);

    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      error: getErrorMessage(error, 'Failed to delete movie'),
    };
  }
};
