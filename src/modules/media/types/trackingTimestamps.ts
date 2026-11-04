export type TrackingTimestamps = {
  startedAt: Date | null;
  completedAt: Date | null;
};

export type TrackingStatus = 'PLAN_TO_WATCH' | 'WATCHING' | 'COMPLETED' | 'DROPPED';
