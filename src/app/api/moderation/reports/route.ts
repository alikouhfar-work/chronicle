import { NextResponse } from 'next/server';
import { logError, logInfo } from '@/infra/logging/logger';
import {
  applyModerationDecision,
  listModerationQueue,
} from '@/modules/comments/services/moderateComments';
import { AppError } from '@/shared/lib/errors';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Moderation queue for public reviews. The same `CRON_SECRET` bearer as the
 * other maintenance routes: there is no moderator role in the product yet, so a
 * token-gated operator surface is the honest scope.
 *
 *   GET  /api/moderation/reports            -> unresolved reports, grouped per review
 *   POST /api/moderation/reports            -> { commentId, action: 'hide'|'dismiss', reason? }
 *
 * Hiding removes the review from every public feed and stores `reason` for its
 * author, who keeps seeing the review with that explanation. Dismissing clears
 * the reports and leaves the review up. Both resolve every open report on the
 * review.
 */
const authorized = (request: Request): boolean => {
  const secret = process.env.CRON_SECRET;
  return Boolean(secret) && request.headers.get('authorization') === `Bearer ${secret}`;
};

export const GET = async (request: Request) => {
  if (!authorized(request)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const items = await listModerationQueue();
    return NextResponse.json({ ok: true, count: items.length, items });
  } catch (error) {
    logError({ event: 'moderation.queue', route: '/api/moderation/reports', error });
    return NextResponse.json({ ok: false, error: 'Could not load the queue.' }, { status: 500 });
  }
};

export const POST = async (request: Request) => {
  if (!authorized(request)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const payload = (await request.json().catch(() => null)) as
    | { commentId?: unknown; action?: unknown; reason?: unknown }
    | null;

  if (
    !payload ||
    typeof payload.commentId !== 'string' ||
    (payload.action !== 'hide' && payload.action !== 'dismiss') ||
    (payload.reason !== undefined && typeof payload.reason !== 'string')
  ) {
    return NextResponse.json(
      { ok: false, error: 'Expected { commentId, action: "hide" | "dismiss", reason? }.' },
      { status: 400 },
    );
  }

  try {
    const result = await applyModerationDecision({
      commentId: payload.commentId,
      action: payload.action,
      reason: payload.reason,
    });

    logInfo({
      event: 'moderation.decision',
      action: payload.action,
      meta: { commentId: payload.commentId, resolvedReports: result.resolvedReports },
    });

    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json({ ok: false, error: error.message }, { status: error.status });
    }

    logError({ event: 'moderation.decision', route: '/api/moderation/reports', error });
    return NextResponse.json({ ok: false, error: 'Could not apply the decision.' }, { status: 500 });
  }
};
