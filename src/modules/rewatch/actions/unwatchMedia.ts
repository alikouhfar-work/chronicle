'use server';

import { requireUserId } from '@/infra/tmdb/forUser';
import {
  clearEpisodeWatchHistory,
  clearMovieWatchHistory,
  clearSeasonWatchHistory,
  clearShowWatchHistory,
} from '@/modules/rewatch/services/rewatchService';
import { parseRewatchMediaType } from '@/modules/rewatch/lib/mediaType';
import type { RemoveRewatchActionResult } from '@/modules/rewatch/types/rewatch';
import { getErrorMessage } from '@/shared/lib/errors';
import { revalidateMediaDetail } from '@/shared/lib/revalidate';

/**
 * Clear the watch history of a movie, episode, season, or show. Unlike the legacy
 * `markShowWatched` / `markSeasonWatched` alternatives this keeps
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
            : await clearMovieWatchHistory({ userId, mediaId });

    if (result.tmdbId !== null) {
      revalidateMediaDetail(result.mediaType === 'movie' ? 'movie' : 'tv', result.tmdbId);
    }

    return {
      success: true,
      rewatchCount: result.rewatchCount,
      removedLogs: result.removedLogs,
    };
  } catch (error) {
    return {
      success: false,
      error: getErrorMessage(error, 'Couldn’t clear the watch history. Please try again.'),
    };
  }
};
