import { ShowTrackingStatus } from '../../../../generated/prisma/enums';
import { MediaSortFilter } from '@/features/library';

export const sortMap = {
  title: 'name:asc',
  year: ShowTrackingStatus.COMPLETED,
  recent: ShowTrackingStatus.PLAN_TO_WATCH,
} satisfies Record<MediaSortFilter, 'string:string'>;
