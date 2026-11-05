'use server';

import { requireUserId } from '@/infra/tmdb/forUser';
import { recordRewatch } from '@/modules/rewatch/services/rewatchService';
import type { AddRewatchActionResult, RewatchMediaType } from '@/modules/rewatch/types/rewatch';
import { getErrorMessage } from '@/shared/lib/errors';
import { revalidateMediaDetail } from '@/shared/lib/revalidate';

export const addRewatch = async (
  mediaType: RewatchMediaType,
  mediaId: string,
  rewatchedAt?: string,
  clientRequestId?: string,
): Promise<AddRewatchActionResult> => {
  try {
    const userId = await requireUserId();
    const result = await recordRewatch({
      userId,
      mediaType,
      mediaId,
      rewatchedAt,
      clientRequestId,
    });

    revalidateMediaDetail(result.mediaType === 'movie' ? 'movie' : 'tv', result.tmdbId);

    return {
      success: true,
      rewatchCount: result.rewatchCount,
      logId: result.logId,
      rewatchedAt: result.rewatchedAt.toISOString(),
    };
  } catch (error) {
    return {
      success: false,
      error: getErrorMessage(error, 'Couldn’t log the watch. Please try again.'),
    };
  }
};
