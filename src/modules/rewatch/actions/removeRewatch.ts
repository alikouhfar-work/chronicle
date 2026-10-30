'use server';

import { requireUserId } from '@/infra/tmdb/forUser';
import { removeRewatchLog } from '@/modules/rewatch/services/rewatchService';
import type { RemoveRewatchActionResult } from '@/modules/rewatch/types/rewatch';
import { getErrorMessage } from '@/shared/lib/errors';
import { revalidateMediaDetail } from '@/shared/lib/revalidate';

export const removeRewatch = async (logId: string): Promise<RemoveRewatchActionResult> => {
  try {
    const userId = await requireUserId();
    const result = await removeRewatchLog({ userId, logId });

    if (result.tmdbId !== null) {
      revalidateMediaDetail(result.mediaType === 'movie' ? 'movie' : 'tv', result.tmdbId);
    }

    return { success: true, rewatchCount: result.rewatchCount };
  } catch (error) {
    return {
      success: false,
      error: getErrorMessage(error, 'Couldn’t remove the watch. Please try again.'),
    };
  }
};
