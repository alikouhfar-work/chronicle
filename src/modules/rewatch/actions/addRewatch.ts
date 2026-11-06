'use server';

import { requireUserId } from '@/infra/tmdb/forUser';
import { recordRewatch } from '@/modules/rewatch/services/rewatchService';
import {
  parseRewatchWriteCommand,
  toRewatchFailure,
} from '@/modules/rewatch/lib/writeContract';
import type { AddRewatchActionResult, RewatchMediaType } from '@/modules/rewatch/types/rewatch';
import { revalidateMediaDetail } from '@/shared/lib/revalidate';

export const addRewatch = async (
  mediaType: RewatchMediaType,
  mediaId: string,
  rewatchedAt?: string,
  clientRequestId?: string,
): Promise<AddRewatchActionResult> => {
  try {
    // Same parse + failure mapping as the REST adapter (WP-21).
    const command = parseRewatchWriteCommand({ mediaType, mediaId, rewatchedAt, clientRequestId });
    const userId = await requireUserId();
    const result = await recordRewatch({ userId, ...command });

    revalidateMediaDetail(result.mediaType === 'movie' ? 'movie' : 'tv', result.tmdbId);

    return {
      success: true,
      rewatchCount: result.rewatchCount,
      logId: result.logId,
      rewatchedAt: result.rewatchedAt.toISOString(),
    };
  } catch (error) {
    return { success: false, error: toRewatchFailure(error).message };
  }
};
