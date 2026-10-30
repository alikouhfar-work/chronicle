'use server';

import { requireUserId } from '@/infra/tmdb/forUser';
import { clearEpisodeWatchHistory } from '@/modules/rewatch/services/rewatchService';
import type { RemoveRewatchActionResult } from '@/modules/rewatch/types/rewatch';
import { getErrorMessage } from '@/shared/lib/errors';
import { revalidateMediaDetail } from '@/shared/lib/revalidate';

export const unwatchEpisode = async (episodeId: string): Promise<RemoveRewatchActionResult> => {
  try {
    const userId = await requireUserId();
    const result = await clearEpisodeWatchHistory({ userId, mediaId: episodeId });

    if (result.tmdbId !== null) {
      revalidateMediaDetail('tv', result.tmdbId);
    }

    return { success: true, rewatchCount: result.rewatchCount };
  } catch (error) {
    return {
      success: false,
      error: getErrorMessage(error, 'Couldn’t clear this episode. Please try again.'),
    };
  }
};
