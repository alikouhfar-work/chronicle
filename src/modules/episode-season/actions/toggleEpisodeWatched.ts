'use server';

import { prisma } from '@/infra/db/prisma';
import { DatabaseError, NotFoundError, ValidationError } from '@/shared/lib/errors';
import { parseDbId } from '@/shared/lib/validate';
import { deriveShowStatus } from '@/modules/media/tracking';
import { revalidateMediaDetail } from '@/shared/lib/revalidate';

export const toggleEpisodeWatched = async (showId: string, episodeId: string) => {
  try {
    const sId = parseDbId(showId, 'showId');
    const eId = parseDbId(episodeId, 'episodeId');

    const episode = await prisma.episode.findUnique({
      where: { id: eId },
      select: {
        id: true,
        season: { select: { showId: true } },
        tracking: { select: { watched: true } },
      },
    });

    if (!episode) {
      throw new NotFoundError(`Episode not found: ${eId}`);
    }

    if (episode.season.showId !== sId) {
      throw new ValidationError('Episode does not belong to the given show');
    }

    const currentlyWatched = episode.tracking?.watched ?? false;

    const tmdbId = await prisma.$transaction(async (tx) => {
      if (currentlyWatched) {
        await tx.episodeTracking.delete({ where: { episodeId: eId } });
      } else {
        await tx.episodeTracking.upsert({
          where: { episodeId: eId },
          create: { episodeId: eId, watched: true, watchedAt: new Date() },
          update: { watched: true, watchedAt: new Date() },
        });
      }

      const show = await tx.show.findUnique({
        where: { id: sId },
        select: {
          tmdbId: true,
          seasons: {
            where: { seasonNumber: { not: 0 } },
            select: { episodes: { select: { tracking: { select: { watched: true } } } } },
          },
        },
      });

      if (!show) {
        throw new NotFoundError(`Show not found: ${sId}`);
      }

      const episodes = show.seasons.flatMap((season) => season.episodes);
      const watchedEpisodes = episodes.filter((e) => e.tracking?.watched).length;
      const status = deriveShowStatus(episodes.length, watchedEpisodes);

      await tx.showTracking.upsert({
        where: { showId: sId },
        create: { showId: sId, status },
        update: { status },
      });

      return show.tmdbId;
    });

    revalidateMediaDetail('tv', tmdbId);
  } catch (error) {
    if (error instanceof ValidationError || error instanceof NotFoundError) throw error;
    throw new DatabaseError('Failed to toggle episode watched state', { cause: error });
  }
};
