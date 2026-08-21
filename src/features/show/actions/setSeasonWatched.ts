'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { ShowTrackingStatus } from '../../../../generated/prisma/enums';

export const setSeasonWatched = async (showId: string, seasonId: string, watched: boolean) => {
  const season = await prisma.season.findUnique({
    where: {
      id: seasonId,
    },
    select: {
      episodes: {
        select: {
          id: true,
          airDate: true,
        },
      },
    },
  });

  if (!season) {
    throw new Error('Season not found');
  }

  const airedEpisodes = season.episodes.filter(
    (episode) => episode.airDate && episode.airDate <= new Date(),
  );

  const episodeIds = airedEpisodes.map((episode) => episode.id);

  if (episodeIds.length === 0) {
    return;
  }

  await prisma.$transaction(async (tx) => {
    if (!watched) {
      await tx.episodeTracking.deleteMany({
        where: {
          episodeId: {
            in: episodeIds,
          },
        },
      });
    } else {
      const now = new Date();

      await tx.episodeTracking.createMany({
        data: episodeIds.map((episodeId) => ({
          episodeId,
          watched: true,
          watchedAt: now,
        })),
        skipDuplicates: true,
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

    const tracking = await tx.showTracking.findUnique({
      where: {
        showId,
      },
      select: {
        startedAt: true,
      },
    });

    const now = new Date();

    await tx.showTracking.update({
      where: {
        showId,
      },
      data: {
        status,
        startedAt:
          status === ShowTrackingStatus.PLAN_TO_WATCH ? null : (tracking?.startedAt ?? now),
        completedAt: status === ShowTrackingStatus.COMPLETED ? now : null,
      },
    });
  });

  revalidatePath(`/tv/${showId}`);
};
