import type { RouteContext } from '@/modules/api/types/routeContext';
import { apiError, apiOk } from '@/modules/api/lib/respond';
import { getRewatchHistory } from '@/modules/rewatch/services/getRewatchHistory';
import { requireUserId } from '@/infra/tmdb/forUser';

export const GET = async (_request: Request, context: RouteContext) => {
  try {
    const { type, id } = await context.params;
    const userId = await requireUserId();
    const result = await getRewatchHistory({ userId, mediaType: type, mediaId: id });

    return apiOk({
      mediaType: result.mediaType,
      mediaId: result.mediaId,
      rewatchCount: result.rewatchCount,
      history: result.history.map((entry) => ({
        id: entry.id,
        rewatchedAt: entry.rewatchedAt.toISOString(),
      })),
    });
  } catch (error) {
    return apiError(error);
  }
};
