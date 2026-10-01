'use server';

import { prisma } from '@/infra/db/prisma';
import { ShowTrackingStatus } from '../../../../generated/prisma/enums';
import { DatabaseError, NotFoundError, ValidationError } from '@/shared/lib/errors';
import { parseDbId } from '@/shared/lib/validate';
import { revalidateMediaDetail } from '@/shared/lib/revalidate';

const EPISODE_CHUNK_SIZE = 500;

export const setShowWatched = async (showId: string, watched: boolean) => {
  try {
    const id = parseDbId(showId, 'showId');

    const show = await prisma.show.findUnique({
      where: { id },
      select: {
        tmdbId: true,
        seasons: { select: { episodes: { select: { id: true } } } },
      },
    });

    if (!show) {
      throw new NotFoundError(`Show not found: ${id}`);
    }

    const episodeIds = show.seasons.flatMap((season) => season.episodes.map((episode) => episode.id));
    const now = new Date();

    if (!watched) {
      await prisma.$transaction([
        prisma.episodeTracking.deleteMany({ where: { episodeId: { in: episodeIds } } }),
        prisma.showTracking.upsert({
          where: { showId: id },
          create: { showId: id, status: ShowTrackingStatus.PLAN_TO_WATCH },
          update: { status: ShowTrackingStatus.PLAN_TO_WATCH, startedAt: null, completedAt: null },
        }),
      ]);
    } else {
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
        create: { showId: id, status: ShowTrackingStatus.COMPLETED, startedAt: now, completedAt: now },
        update: { status: ShowTrackingStatus.COMPLETED, startedAt: now, completedAt: now },
      });
    }

    revalidateMediaDetail('tv', show.tmdbId);
  } catch (error) {
    if (error instanceof ValidationError || error instanceof NotFoundError) throw error;
    throw new DatabaseError('Failed to update show watched state', { cause: error });
  }
};
