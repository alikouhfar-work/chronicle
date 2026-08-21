import { ShowStatusFilter } from '@/features/show/types/showStatusFilter';
import { ShowTrackingStatus } from '../../../../generated/prisma/enums';

export const showStatusFilters: ShowStatusFilter[] = [
  {
    key: ShowTrackingStatus.WATCHING,
    title: 'Watching',
  },
  { key: ShowTrackingStatus.PLAN_TO_WATCH, title: 'Plan to Watch' },
  { key: ShowTrackingStatus.COMPLETED, title: 'Completed' },
  { key: ShowTrackingStatus.DROPPED, title: 'Dropped' },
];
