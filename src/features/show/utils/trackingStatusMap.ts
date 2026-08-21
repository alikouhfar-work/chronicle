import { ShowTrackingStatus } from '../../../../generated/prisma/enums';
import { StatusFilter } from '@/features/library';

export const showTrackingStatusMap = {
  plan_to_watch: ShowTrackingStatus.PLAN_TO_WATCH,
  watching: ShowTrackingStatus.WATCHING,
  completed: ShowTrackingStatus.COMPLETED,
  dropped: ShowTrackingStatus.DROPPED,
} satisfies Record<Exclude<StatusFilter, 'all'>, ShowTrackingStatus>;