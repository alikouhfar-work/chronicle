'use server';

import { requireUserId } from '@/infra/tmdb/forUser';
import { getRewatchHistory } from '@/modules/rewatch/services/rewatchService';
import type {
  GetRewatchHistoryActionResult,
  RewatchMediaType,
} from '@/modules/rewatch/types/rewatch';
import { getErrorMessage } from '@/shared/lib/errors';

export const loadRewatchHistory = async (
  mediaType: RewatchMediaType,
  mediaId: string,
): Promise<GetRewatchHistoryActionResult> => {
  try {
    const userId = await requireUserId();
    const result = await getRewatchHistory({ userId, mediaType, mediaId });

    return {
      success: true,
      rewatchCount: result.rewatchCount,
      history: result.history.map((entry) => ({
        id: entry.id,
        rewatchedAt: entry.rewatchedAt.toISOString(),
      })),
    };
  } catch (error) {
    return {
      success: false,
      error: getErrorMessage(error, 'Couldn’t load the watch history. Please try again.'),
    };
  }
};
