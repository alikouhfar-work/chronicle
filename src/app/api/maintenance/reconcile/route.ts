import { env } from '@/infra/env';
import { NextResponse } from 'next/server';
import { logError, logInfo } from '@/infra/logging/logger';
import { reconcileCounters } from '@/modules/rewatch/services/reconcileCounters';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Counter reconciliation for the derived numbers. Report mode is the default and
 * only reads; `?fix=1` writes the expected values.
 *
 *   GET /api/maintenance/reconcile              Authorization: Bearer ***
 *   GET /api/maintenance/reconcile?fix=1        Authorization: Bearer ***
 *
 * The counters it checks: `Episode/Show/Movie.rewatch_count` against their log
 * rows, and `Season.rewatch_count` against the season rule derived from its
 * episodes. TMDB metadata drift is not touched — it is refreshed by the sync
 * paths, not repaired here.
 */
export const GET = async (request: Request) => {
  const secret = env.cronSecret;
  const authorization = request.headers.get('authorization');

  if (!secret || authorization !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const fix = new URL(request.url).searchParams.get('fix') === '1';

  try {
    const report = await reconcileCounters({ fix });

    logInfo({
      event: 'maintenance.reconcile',
      meta: {
        fix,
        checked: report.checked,
        drift: report.drift.length,
        fixed: report.fixed,
      },
    });

    return NextResponse.json({ ok: true, ...report });
  } catch (error) {
    logError({ event: 'maintenance.reconcile', route: '/api/maintenance/reconcile', error });
    return NextResponse.json(
      { ok: false, error: 'Reconciliation failed.' },
      { status: 500 },
    );
  }
};
