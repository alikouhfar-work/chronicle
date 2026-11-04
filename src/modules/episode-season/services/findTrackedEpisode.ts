import 'server-only';

import { prisma } from '@/infra/db/prisma';
import type { TrackedEpisodeDetails } from '@/modules/episode-season/types/episode';
import { parseDbId, parseTmdbId } from '@/shared/lib/validate';

/**
 * Loads one episode with its season and parent show. `userId` scopes the read
 * to that user's copy; omitting it allows the public (review-page) lookup.
 */
export const findTrackedEpisode = async (
  showTmdbId: string,
  episodeId: string,
  userId?: string,
): Promise<TrackedEpisodeDetails | null> => {
  const tmdbId = parseTmdbId(showTmdbId);
  const id = parseDbId(episodeId, 'episodeId');

  const episode = await prisma.episode.findFirst({
    where: {
      id,
      season: {
        show: userId ? { userId, tmdbId } : { tmdbId },
      },
    },
    include: {
      tracking: true,
      season: {
        select: {
          id: true,
          name: true,
          seasonNumber: true,
          show: {
            select: {
              id: true,
              tmdbId: true,
              name: true,
              posterPath: true,
              backdropPath: true,
              overview: true,
            },
          },
        },
      },
    },
  });

  if (!episode) return null;

  const { show, ...season } = episode.season;

  return {
    show,
    season,
    episode: {
      id: episode.id,
      tmdbId: episode.tmdbId,
      episodeNumber: episode.episodeNumber,
      name: episode.name,
      overview: episode.overview,
      runtime: episode.runtime,
      airDate: episode.airDate,
      rewatchCount: episode.rewatchCount,
      tracking: episode.tracking,
    },
  };
};
