import { MovieTrackingStatus } from '../../../../generated/prisma/enums';
import { MovieStatusFilter } from '@/modules/movie/types/movieStatusFilter';

export const movieStatusFilters: MovieStatusFilter[] = [
  { key: MovieTrackingStatus.PLAN_TO_WATCH, title: 'Plan to Watch' },
  {
    key: MovieTrackingStatus.WATCHING,
    title: 'Watching',
  },
  { key: MovieTrackingStatus.COMPLETED, title: 'Completed' },
];
