import 'server-only';

import { requireUserId } from '@/infra/tmdb/forUser';
import { findTrackedEpisode } from '@/modules/episode-season/services/findTrackedEpisode';
import type { TrackedEpisodeDetails } from '@/modules/episode-season/types/episode';
import { DatabaseError, NotFoundError, ValidationError } from '@/shared/lib/errors';

/** Signed-in lookup scoped to the viewer's library. */
export const getTrackedEpisode = async (
  showTmdbId: string,
  episodeId: string,
): Promise<TrackedEpisodeDetails | null> => {
  try {
    const userId = await requireUserId();
    return await findTrackedEpisode(showTmdbId, episodeId, userId);
  } catch (error) {
    if (error instanceof ValidationError || error instanceof NotFoundError) throw error;
    throw new DatabaseError(`Failed to load episode "${episodeId}"`, { cause: error });
  }
};
