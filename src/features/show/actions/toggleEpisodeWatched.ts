'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { ShowTrackingStatus } from '../../../../generated/prisma/enums';

export const toggleEpisodeWatched = async (showId: string, episodeId: string) => {
  const episode = await prisma.episode.findUnique({
    where: {
      id: episodeId,
    },
    select: {
      id: true,
      tracking: {
        select: {
          watched: true,
        },
      },
    },
  });

  if (!episode) {
    throw new Error('Episode not found');
  }

  const currentlyWatched = episode.tracking?.watched ?? false;

  await prisma.$transaction(async (tx) => {
    if (currentlyWatched) {
      await tx.episodeTracking.delete({
        where: {
          episodeId,
        },
      });
    } else {
      await tx.episodeTracking.upsert({
        where: {
          episodeId,
        },
        create: {
          episodeId,
          watched: true,
          watchedAt: new Date(),
        },
        update: {
          watched: true,
          watchedAt: new Date(),
        },
      });
    }

    const show = await tx.show.findUnique({
      where: {
        id: showId,
      },
      select: {
        seasons: {
          where: {
            seasonNumber: {
              not: 0,
            },
          },
          select: {
            episodes: {
              select: {
                tracking: {
                  select: {
                    watched: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!show) {
      throw new Error('Show not found');
    }

    const episodes = show.seasons.flatMap((season) => season.episodes);

    const totalEpisodes = episodes.length;
    const watchedEpisodes = episodes.filter((episode) => episode.tracking?.watched).length;

    let status: ShowTrackingStatus = ShowTrackingStatus.PLAN_TO_WATCH;

    if (totalEpisodes > 0 && watchedEpisodes === totalEpisodes) {
      status = ShowTrackingStatus.COMPLETED;
    } else if (watchedEpisodes > 0) {
      status = ShowTrackingStatus.WATCHING;
    }

    await tx.showTracking.update({
      where: {
        showId,
      },
      data: {
        status,
      },
    });
  });

  revalidatePath('/');
  revalidatePath(`/tv/${showId}`);
};
