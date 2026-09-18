'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { ShowTrackingStatus } from '../../../../generated/prisma/enums';

export const setShowWatched = async (showId: string, watched: boolean) => {
  const show = await prisma.show.findUnique({
    where: { id: showId },
    select: {
      seasons: {
        select: {
          episodes: {
            select: { id: true },
          },
        },
      },
    },
  });

  if (!show) {
    throw new Error('Show not found');
  }

  const episodeIds = show.seasons.flatMap((season) => season.episodes.map((episode) => episode.id));

  const now = new Date();

  if (!watched) {
    await prisma.$transaction([
      // Clear all episode tracking for the show
      prisma.episodeTracking.deleteMany({
        where: { episodeId: { in: episodeIds } },
      }),
      // Reset show tracking back to PLAN_TO_WATCH
      prisma.showTracking.upsert({
        where: { showId },
        create: {
          showId,
          status: ShowTrackingStatus.PLAN_TO_WATCH,
        },
        update: {
          status: ShowTrackingStatus.PLAN_TO_WATCH,
          startedAt: null,
          completedAt: null,
        },
      }),
    ]);
  } else {
    await prisma.$transaction([
      // Mark every episode as watched
      ...episodeIds.map((episodeId) =>
        prisma.episodeTracking.upsert({
          where: { episodeId },
          create: {
            episodeId,
            watched: true,
            watchedAt: now,
          },
          update: {
            watched: true,
            watchedAt: now,
          },
        }),
      ),
      // Mark the show as COMPLETED
      prisma.showTracking.upsert({
        where: { showId },
        create: {
          showId,
          status: ShowTrackingStatus.COMPLETED,
          startedAt: now,
          completedAt: now,
        },
        update: {
          status: ShowTrackingStatus.COMPLETED,
          startedAt: now,
          completedAt: now,
        },
      }),
    ]);
  }

  revalidatePath(`/tv/${showId}`);
};
