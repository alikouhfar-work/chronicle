import { getTrackedShow } from '@/modules/show/queries/getTrackedShow';
import { shouldSyncShow } from '@/modules/show/utils/shouldSyncShow';
import { syncShow } from '@/modules/show/actions/syncShow';

export const getFreshTrackedShow = async (id: string) => {
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
