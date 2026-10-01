import { prisma } from '@/infra/db/prisma';
import { TrackedShow } from '@/modules/show';
import { DatabaseError, NotFoundError, ValidationError } from '@/shared/lib/errors';
import { parseTmdbId } from '@/shared/lib/validate';

export const getTrackedShow = async (id: string): Promise<TrackedShow | null> => {
  try {
    const tmdbId = parseTmdbId(id);
    return await prisma.show.findUnique({
      where: { tmdbId },
      include: {
        genres: true,
        tracking: true,
        seasons: {
          where: { seasonNumber: { not: 0 } },
          orderBy: { seasonNumber: 'asc' },
          include: {
            episodes: {
              orderBy: { episodeNumber: 'asc' },
              include: { tracking: true },
            },
          },
        },
      },
    });
  } catch (error) {
    if (error instanceof ValidationError || error instanceof NotFoundError) throw error;
    throw new DatabaseError(`Failed to load tracked show "${id}"`, { cause: error });
  }
};
