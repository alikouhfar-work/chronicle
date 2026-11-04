import 'server-only';

import { getTrackedShow } from '@/modules/show/services/getTrackedShow';
import { shouldSyncShow } from '@/modules/show/utils/shouldSyncShow';
import { syncShow } from '@/modules/show/actions/syncShow';

/**
 * Reads a tracked show, refreshing it from TMDB first when the cached copy is
 * stale. Sync failures fall back to the cached row so pages still render.
 */
export const getSyncedTrackedShow = async (id: string) => {
  const show = await getTrackedShow(id);
  if (!show) return null;

  if (!shouldSyncShow(show)) return show;

  try {
    await syncShow(id);
  } catch {
    // Best-effort sync: fall back to the cached show on failure.
    return show;
  }

  return (await getTrackedShow(id)) ?? show;
};
