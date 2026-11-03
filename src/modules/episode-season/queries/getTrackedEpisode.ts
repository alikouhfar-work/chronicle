import { prisma } from '@/infra/db/prisma';
import { requireUserId } from '@/infra/tmdb/forUser';
import type { TrackedEpisodeDetails } from '@/modules/episode-season/types/episode';
import { DatabaseError, NotFoundError, ValidationError } from '@/shared/lib/errors';
import { parseDbId, parseTmdbId } from '@/shared/lib/validate';

const loadEpisode = async (
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

/** Signed-in lookup scoped to the viewer's library. */
export const getTrackedEpisode = async (
  showTmdbId: string,
  episodeId: string,
): Promise<TrackedEpisodeDetails | null> => {
  try {
    const userId = await requireUserId();
    return await loadEpisode(showTmdbId, episodeId, userId);
  } catch (error) {
    if (error instanceof ValidationError || error instanceof NotFoundError) throw error;
    throw new DatabaseError(`Failed to load episode "${episodeId}"`, { cause: error });
  }
};

/**
 * Public lookup for signed-out readers. Review pages are shareable, so the
 * episode can be resolved without a user; the review feed is still keyed by
 * the episode's TMDB id.
 */
export const getEpisodeDetails = async (
  showTmdbId: string,
  episodeId: string,
): Promise<TrackedEpisodeDetails | null> => {
  try {
    return await loadEpisode(showTmdbId, episodeId);
  } catch (error) {
    if (error instanceof ValidationError || error instanceof NotFoundError) throw error;
    throw new DatabaseError(`Failed to load episode "${episodeId}"`, { cause: error });
  }
};
