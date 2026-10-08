import { prisma } from '@/infra/db/prisma';
import { requireUserId } from '@/infra/tmdb/forUser';
import { TrackedMovie } from '@/modules/movie';
import { DatabaseError, NotFoundError, ValidationError } from '@/shared/lib/errors';
import { parseTmdbId } from '@/shared/lib/validate';

export const getTrackedMovie = async (id: string): Promise<TrackedMovie | null> => {
  try {
    const userId = await requireUserId();
    const tmdbId = parseTmdbId(id);
    return await prisma.movie.findUnique({
      where: { userId_tmdbId: { userId, tmdbId } },
      include: { genres: true, tracking: true },
    });
  } catch (error) {
    if (error instanceof ValidationError || error instanceof NotFoundError) throw error;
    throw new DatabaseError(`Failed to load tracked movie "${id}"`, { cause: error });
  }
};
