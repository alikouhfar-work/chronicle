'use server';

import { requireUserId } from '@/infra/tmdb/forUser';
import {
  clearEpisodeWatchHistory,
  clearSeasonWatchHistory,
  clearShowWatchHistory,
} from '@/modules/rewatch/services/rewatchService';
import { parseRewatchMediaType } from '@/modules/rewatch/lib/mediaType';
import type { RemoveRewatchActionResult } from '@/modules/rewatch/types/rewatch';
import { getErrorMessage } from '@/shared/lib/errors';
import { revalidateMediaDetail } from '@/shared/lib/revalidate';

/**
 * Clear the watch history of an episode, season, or show. Unlike the legacy
 * `setShowWatched(false)` / `setSeasonWatched(..., false)` toggles this keeps
 * the tracking rows, so ratings survive; only watches are removed.
 */
export const unwatchMedia = async (
  mediaType: string,
  mediaId: string,
): Promise<RemoveRewatchActionResult> => {
  try {
    const mediaTypeValue = parseRewatchMediaType(mediaType);
    const userId = await requireUserId();

    const result =
      mediaTypeValue === 'episode'
        ? await clearEpisodeWatchHistory({ userId, mediaId })
        : mediaTypeValue === 'season'
          ? await clearSeasonWatchHistory({ userId, mediaId })
          : mediaTypeValue === 'show'
            ? await clearShowWatchHistory({ userId, mediaId })
            : null;

    if (!result) {
      return { success: false, error: 'Only episodes, seasons, and shows can be unwatched here.' };
    }

    if (result.tmdbId !== null) {
      revalidateMediaDetail('tv', result.tmdbId);
    }

    return { success: true, rewatchCount: result.rewatchCount };
  } catch (error) {
    return {
      success: false,
      error: getErrorMessage(error, 'Couldn’t clear the watch history. Please try again.'),
    };
  }
};
