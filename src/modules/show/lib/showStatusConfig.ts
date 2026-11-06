import { ShowTrackingStatus } from '../../../../generated/prisma/enums';

export const showStatusConfig = {
  [ShowTrackingStatus.WATCHING]: {
    title: 'Watching',
    colors: 'bg-accent-soft text-accent-ink border-accent-line',
  },
  [ShowTrackingStatus.COMPLETED]: {
    title: 'Completed',
    colors: 'bg-info-soft text-info border-info/30',
  },
  [ShowTrackingStatus.PLAN_TO_WATCH]: {
    title: 'Plan To Watch',
    colors: 'bg-surface-strong/80 text-ink-secondary border-line',
  },
  [ShowTrackingStatus.DROPPED]: {
    title: 'Dropped',
    colors: 'bg-danger-soft text-danger border-danger/30',
  },
};
