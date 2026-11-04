import type { RouteContext } from '@/modules/api/types/routeContext';
import { apiError, apiOk } from '@/modules/api/lib/respond';
import { removeRewatchLog } from '@/modules/rewatch/services/rewatchService';
import { requireUserId } from '@/infra/tmdb/forUser';

export const DELETE = async (_request: Request, context: RouteContext<{ logId: string }>) => {
  try {
    const { logId } = await context.params;
    const userId = await requireUserId();
    const result = await removeRewatchLog({ userId, logId });

    return apiOk({
      deleted: true,
      mediaType: result.mediaType,
      mediaId: result.mediaId,
      rewatchCount: result.rewatchCount,
    });
  } catch (error) {
    return apiError(error);
  }
};
