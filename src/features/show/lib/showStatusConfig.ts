import { ShowTrackingStatus } from '../../../../generated/prisma/enums';

export const showStatusConfig = {
  [ShowTrackingStatus.WATCHING]: {
    title: 'Watching',
    colors: 'bg-gold-400/10 text-gold-400 border-gold-400/20',
  },
  [ShowTrackingStatus.COMPLETED]: {
    title: 'Completed',
    colors: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  },
  [ShowTrackingStatus.PLAN_TO_WATCH]: {
    title: 'Plan To Watch',
    colors: 'bg-zinc-800/80 text-zinc-300 border-zinc-700/60',
  },
  [ShowTrackingStatus.DROPPED]: {
    title: 'Dropped',
    colors: 'bg-red-500/10 text-red-400 border-red-500/20',
  },
};
