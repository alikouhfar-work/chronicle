'use server';

import { requireUserId } from '@/infra/tmdb/forUser';
import { restoreWatchRemoval } from '@/modules/rewatch/services/rewatchService';
import type { UndoUnwatchActionResult } from '@/modules/rewatch/types/rewatch';
import { getErrorMessage } from '@/shared/lib/errors';
import { revalidateMediaDetail } from '@/shared/lib/revalidate';

/**
 * Undo an unwatch: replay the removal snapshot while its window is still open.
 * The service refuses when new watches landed on the same title in the
 * meantime, so this can never overwrite work done after the removal.
 */
export const undoUnwatch = async (removalId: string): Promise<UndoUnwatchActionResult> => {
  try {
    const userId = await requireUserId();
    const result = await restoreWatchRemoval({ userId, removalId });

    revalidateMediaDetail(result.mediaType === 'movie' ? 'movie' : 'tv', result.tmdbId);

    return {
      success: true,
      rewatchCount: result.rewatchCount,
      mediaType: result.mediaType,
      mediaId: result.mediaId,
    };
  } catch (error) {
    return {
      success: false,
      error: getErrorMessage(error, 'Couldn’t restore the watch history. Please try again.'),
    };
  }
};
