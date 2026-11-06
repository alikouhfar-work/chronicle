'use server';

import { requireUserId } from '@/infra/tmdb/forUser';
import { removeRewatchLog } from '@/modules/rewatch/services/rewatchService';
import {
  parseRewatchLogId,
  toRewatchRemoveFailure,
} from '@/modules/rewatch/lib/writeContract';
import type { RemoveRewatchActionResult } from '@/modules/rewatch/types/rewatch';
import { revalidateMediaDetail } from '@/shared/lib/revalidate';

export const removeRewatch = async (logId: string): Promise<RemoveRewatchActionResult> => {
  try {
    const userId = await requireUserId();
    const result = await removeRewatchLog({ userId, logId: parseRewatchLogId(logId) });

    if (result.tmdbId !== null) {
      revalidateMediaDetail(result.mediaType === 'movie' ? 'movie' : 'tv', result.tmdbId);
    }

    return {
      success: true,
      rewatchCount: result.rewatchCount,
      removedLogs: result.removedLogs,
      undoToken: result.undoToken,
    };
  } catch (error) {
    return { success: false, error: toRewatchRemoveFailure(error).message };
  }
};
