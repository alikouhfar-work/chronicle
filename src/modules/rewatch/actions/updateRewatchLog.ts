'use server';

import { requireUserId } from '@/infra/tmdb/forUser';
import { updateRewatchLog as updateLog } from '@/modules/rewatch/services/rewatchService';
import type { UpdateRewatchActionResult } from '@/modules/rewatch/types/rewatch';
import { getErrorMessage } from '@/shared/lib/errors';
import { revalidateMediaDetail } from '@/shared/lib/revalidate';

/**
 * Correct the date of a logged watch. Never changes counts, so the season rule
 * and the watch totals stay as they were.
 */
export const updateRewatchLog = async (
  logId: string,
  rewatchedAt: string,
): Promise<UpdateRewatchActionResult> => {
  try {
    const userId = await requireUserId();
    const result = await updateLog({ userId, logId, rewatchedAt });

    if (result.tmdbId !== null) {
      revalidateMediaDetail(result.mediaType === 'movie' ? 'movie' : 'tv', result.tmdbId);
    }

    return {
      success: true,
      logId: result.logId,
      rewatchedAt: result.rewatchedAt.toISOString(),
    };
  } catch (error) {
    return {
      success: false,
      error: getErrorMessage(error, 'Couldn’t update the watch date. Please try again.'),
    };
  }
};
