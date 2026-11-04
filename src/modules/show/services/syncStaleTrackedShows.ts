import 'server-only';

import { prisma } from '@/infra/db/prisma';
import { requireUserId } from '@/infra/tmdb/forUser';
import { getSyncedTrackedShow } from '@/modules/show/services/getSyncedTrackedShow';
import { DatabaseError } from '@/shared/lib/errors';

/** Refreshes every show the viewer is currently watching, best-effort. */
export const syncStaleTrackedShows = async (): Promise<void> => {
  try {
    const userId = await requireUserId();
    const watchingShows = await prisma.show.findMany({
      where: { userId, tracking: { status: 'WATCHING' } },
      select: { tmdbId: true },
    });

    // Best-effort refresh: individual sync failures resolve as stale data.
    await Promise.allSettled(
      watchingShows.map(({ tmdbId }) => getSyncedTrackedShow(tmdbId.toString())),
    );
  } catch (error) {
    throw new DatabaseError('Failed to refresh tracked shows', { cause: error });
  }
};
