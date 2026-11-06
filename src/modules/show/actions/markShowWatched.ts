'use server';

import { prisma } from '@/infra/db/prisma';
import { requireUserId } from '@/infra/tmdb/forUser';
import { ShowTrackingStatus } from '../../../../generated/prisma/enums';
import { DatabaseError, NotFoundError, ValidationError } from '@/shared/lib/errors';
import { parseDbId } from '@/shared/lib/validate';
import { revalidateMediaDetail } from '@/shared/lib/revalidate';

const EPISODE_CHUNK_SIZE = 500;

/**
 * Marks every episode of a show as watched and completes its tracking.
 * Removing a watch goes through `unwatchMedia`, which keeps tracking rows.
 */
export const markShowWatched = async (showId: string) => {
  try {
    const id = parseDbId(showId, 'showId');
    const userId = await requireUserId();

    const show = await prisma.show.findUnique({
      where: { id },
      select: {
        userId: true,
        tmdbId: true,
        seasons: { select: { episodes: { select: { id: true } } } },
      },
    });

    if (!show || show.userId !== userId) {
      throw new NotFoundError(`Show not found: ${id}`);
    }

    const episodeIds = show.seasons.flatMap((season) => season.episodes.map((episode) => episode.id));
    const now = new Date();

    // Chunked writes keep each statement bounded for very long shows.
    for (let i = 0; i < episodeIds.length; i += EPISODE_CHUNK_SIZE) {
      const chunk = episodeIds.slice(i, i + EPISODE_CHUNK_SIZE);
      await prisma.episodeTracking.createMany({
        data: chunk.map((episodeId) => ({ episodeId, watched: true, watchedAt: now })),
        skipDuplicates: true,
      });
    }

    await prisma.showTracking.upsert({
      where: { showId: id },
      create: {
        showId: id,
        status: ShowTrackingStatus.COMPLETED,
        startedAt: now,
        completedAt: now,
      },
      update: {
        status: ShowTrackingStatus.COMPLETED,
        startedAt: now,
        completedAt: now,
      },
    });

    revalidateMediaDetail('tv', show.tmdbId);
  } catch (error) {
    if (error instanceof ValidationError || error instanceof NotFoundError) throw error;
    throw new DatabaseError('Failed to mark show as watched', { cause: error });
  }
};
