'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';

export const setShowWatched = async (showId: string, watched: boolean) => {
  const show = await prisma.show.findUnique({
    where: {
      id: showId,
    },
    select: {
      seasons: {
        select: {
          episodes: {
            select: {
              id: true,
            },
          },
        },
      },
    },
  });

  if (!show) {
    throw new Error('Show not found');
  }

  const episodeIds = show.seasons.flatMap((season) => season.episodes.map((episode) => episode.id));

  if (!watched) {
    await prisma.episodeTracking.deleteMany({
      where: {
        episodeId: {
          in: episodeIds,
        },
      },
    });
  } else {
    const now = new Date();

    await prisma.$transaction(
      episodeIds.map((episodeId) =>
        prisma.episodeTracking.upsert({
          where: {
            episodeId,
          },
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
    );
  }

  revalidatePath(`/tv/${showId}`);
};
