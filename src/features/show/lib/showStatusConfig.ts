import { ShowTrackingStatus } from '../../../../generated/prisma/enums';

export const showStatusConfig = {
  [ShowTrackingStatus.WATCHING]: {
    title: 'Watching',
    colors: 'bg-violet-500/15 text-violet-300 border-violet-500/30',
  },
  [ShowTrackingStatus.COMPLETED]: {
    title: 'Completed',
    colors: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
  },
  [ShowTrackingStatus.PLAN_TO_WATCH]: {
    title: 'Plan To Watch',
    colors: 'bg-zinc-800/80 text-zinc-300 border-zinc-700/60',
  },
  [ShowTrackingStatus.DROPPED]: {
    title: 'Dropped',
    colors: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
  },
};
