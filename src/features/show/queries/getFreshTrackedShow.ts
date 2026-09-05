import { syncShow } from '@/features/show';
import { getTrackedShow } from '@/features/show/queries/getTrackedShow';
import { shouldSyncShow } from '@/features/show/utils/shouldSyncShow';

export const getFreshTrackedShow = async (id: string) => {
  const show = await getTrackedShow(id);

  if (!show) {
    return null;
  }

  const shouldSync = shouldSyncShow(show);

  if (!shouldSync) {
    return show;
  }

  await syncShow(id);

  return show;
};
