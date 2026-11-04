import type { TrackingStatus, TrackingTimestamps } from '@/modules/media/types/trackingTimestamps';
export const buildTrackingTimestamps = (
  status: TrackingStatus,
  previousStartedAt: Date | null | undefined,
  now: Date = new Date(),
): TrackingTimestamps => {
  if (status === 'PLAN_TO_WATCH') {
    return { startedAt: null, completedAt: null };
  }

  if (status === 'COMPLETED') {
    return { startedAt: previousStartedAt ?? now, completedAt: now };
  }

  return { startedAt: previousStartedAt ?? now, completedAt: null };
};

export const deriveShowStatus = (
  totalEpisodes: number,
  watchedEpisodes: number,
): 'PLAN_TO_WATCH' | 'WATCHING' | 'COMPLETED' => {
  if (totalEpisodes > 0 && watchedEpisodes === totalEpisodes) {
    return 'COMPLETED';
  }
  if (watchedEpisodes > 0) {
    return 'WATCHING';
  }
  return 'PLAN_TO_WATCH';
};
