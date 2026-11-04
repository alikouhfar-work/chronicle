import 'server-only';

import { findTrackedEpisode } from '@/modules/episode-season/services/findTrackedEpisode';
import type { TrackedEpisodeDetails } from '@/modules/episode-season/types/episode';
import { DatabaseError, NotFoundError, ValidationError } from '@/shared/lib/errors';

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
    return await findTrackedEpisode(showTmdbId, episodeId);
  } catch (error) {
    if (error instanceof ValidationError || error instanceof NotFoundError) throw error;
    throw new DatabaseError(`Failed to load episode "${episodeId}"`, { cause: error });
  }
};
