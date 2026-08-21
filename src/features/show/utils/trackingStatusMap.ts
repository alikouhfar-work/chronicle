import { ShowTrackingStatus } from '../../../../generated/prisma/enums';
import { MediaStatusFilter } from '@/features/library';

export const showTrackingStatusMap = {
  plan_to_watch: ShowTrackingStatus.PLAN_TO_WATCH,
  watching: ShowTrackingStatus.WATCHING,
  completed: ShowTrackingStatus.COMPLETED,
  dropped: ShowTrackingStatus.DROPPED,
} satisfies Record<Exclude<MediaStatusFilter, 'all'>, ShowTrackingStatus>;