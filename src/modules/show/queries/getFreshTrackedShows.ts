import { prisma } from '@/infra/db/prisma';
import { getFreshTrackedShow } from '@/modules/show/queries/getFreshTrackedShow';
import { DatabaseError } from '@/shared/lib/errors';

export const getFreshTrackedShows = async (): Promise<void> => {
  try {
    const watchingShows = await prisma.show.findMany({
      where: { tracking: { status: 'WATCHING' } },
      select: { tmdbId: true },
    });

    // Best-effort refresh: individual sync failures resolve as stale data.
    await Promise.allSettled(
      watchingShows.map(({ tmdbId }) => getFreshTrackedShow(tmdbId.toString())),
    );
  } catch (error) {
    throw new DatabaseError('Failed to refresh tracked shows', { cause: error });
  }
};
