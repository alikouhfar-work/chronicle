import type { RouteContext } from '@/modules/api/types/routeContext';
import { apiError, apiOk } from '@/modules/api/lib/respond';
import { recordRewatch } from '@/modules/rewatch/services/rewatchService';
import { requireUserId } from '@/infra/tmdb/forUser';

export const POST = async (request: Request, context: RouteContext) => {
  try {
    const { type, id } = await context.params;
    const payload = (await request.json().catch(() => null)) as
      | Record<string, unknown>
      | null;
    const rewatchedAt = payload?.rewatched_at ?? payload?.rewatchedAt ?? payload?.date;
    const userId = await requireUserId();

    const result = await recordRewatch({
      userId,
      mediaType: type,
      mediaId: id,
      rewatchedAt,
    });

    return apiOk(
      {
        mediaType: result.mediaType,
        mediaId: result.mediaId,
        rewatchCount: result.rewatchCount,
        log: {
          id: result.logId,
          rewatchedAt: result.rewatchedAt.toISOString(),
        },
      },
      { status: 201 },
    );
  } catch (error) {
    return apiError(error);
  }
};
