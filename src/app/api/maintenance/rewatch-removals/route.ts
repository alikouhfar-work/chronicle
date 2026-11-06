import { env } from '@/infra/env';
import { NextResponse } from 'next/server';
import { logError, logInfo } from '@/infra/logging/logger';
import { purgeExpiredRemovals } from '@/modules/rewatch/services/rewatchService';
import { REWATCH_UNDO_WINDOW_MS } from '@/modules/rewatch/lib/removalPayload';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Drops undo snapshots whose window has closed. Same `CRON_SECRET` bearer as the
 * other maintenance routes:
 *
 *   GET /api/maintenance/rewatch-removals  Authorization: Bearer ***
 *
 * A snapshot is the only thing holding a removed watch's rows and counters, so
 * deleting it past `REWATCH_UNDO_WINDOW_MS` is safe by construction — the
 * snapshot could no longer be replayed. New removals also purge their owner's
 * expired rows, so this route exists to bound the table when nobody unwatches.
 */
export const GET = async (request: Request) => {
  const secret = env.cronSecret;
  const authorization = request.headers.get('authorization');

  if (!secret || authorization !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const purged = await purgeExpiredRemovals();

    logInfo({ event: 'maintenance.rewatch-removals.purged', meta: { purged } });

    return NextResponse.json({
      ok: true,
      purged,
      windowMinutes: REWATCH_UNDO_WINDOW_MS / 60_000,
    });
  } catch (error) {
    logError({
      event: 'maintenance.rewatch-removals',
      route: '/api/maintenance/rewatch-removals',
      error,
    });
    return NextResponse.json({ ok: false, error: 'Purge failed.' }, { status: 500 });
  }
};
