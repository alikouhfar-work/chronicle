import { ShowTrackingStatus } from '../../../../generated/prisma/enums';
import { MovieStatusFilter } from '@/features/movie/types/movieStatusFilter';

export const movieStatusFilters: MovieStatusFilter[] = [
  { key: ShowTrackingStatus.PLAN_TO_WATCH, title: 'Plan to Watch' },
  {
    key: ShowTrackingStatus.WATCHING,
    title: 'Watching',
  },
  { key: ShowTrackingStatus.COMPLETED, title: 'Completed' },
];
