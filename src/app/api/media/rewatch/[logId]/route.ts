import { NextResponse } from 'next/server';
import type { RouteContext } from '@/infra/http/routeContext';
import { apiOk } from '@/infra/http/respond';
import { removeRewatchLog } from '@/modules/rewatch/services/rewatchService';
import {
  parseRewatchLogId,
  toRewatchRemoveFailure,
} from '@/modules/rewatch/lib/writeContract';
import { requireUserId } from '@/infra/tmdb/forUser';

export const DELETE = async (_request: Request, context: RouteContext<{ logId: string }>) => {
  try {
    const { logId } = await context.params;
    const userId = await requireUserId();
    const result = await removeRewatchLog({ userId, logId: parseRewatchLogId(logId) });

    return apiOk({
      deleted: true,
      mediaType: result.mediaType,
      mediaId: result.mediaId,
      rewatchCount: result.rewatchCount,
    });
  } catch (error) {
    const failure = toRewatchRemoveFailure(error);
    return NextResponse.json(
      { ok: false, error: failure.message, code: failure.code },
      { status: failure.status },
    );
  }
};
