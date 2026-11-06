import { NextResponse } from 'next/server';
import type { RouteContext } from '@/infra/http/routeContext';
import { apiOk } from '@/infra/http/respond';
import { recordRewatch } from '@/modules/rewatch/services/rewatchService';
import {
  parseRewatchWriteCommand,
  readRewatchWriteFields,
  toRewatchFailure,
} from '@/modules/rewatch/lib/writeContract';
import { requireUserId } from '@/infra/tmdb/forUser';

export const POST = async (request: Request, context: RouteContext) => {
  try {
    const { type, id } = await context.params;
    const payload = await request.json().catch(() => null);
    // The same fields, aliases and validation the server action uses; retries
    // carry `Idempotency-Key` so a timeout cannot log the watch twice.
    const command = parseRewatchWriteCommand({
      mediaType: type,
      mediaId: id,
      ...readRewatchWriteFields(payload, request.headers.get('idempotency-key')),
    });
    const userId = await requireUserId();

    const result = await recordRewatch({ userId, ...command });

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
    const failure = toRewatchFailure(error);
    return NextResponse.json(
      { ok: false, error: failure.message, code: failure.code },
      { status: failure.status },
    );
  }
};
