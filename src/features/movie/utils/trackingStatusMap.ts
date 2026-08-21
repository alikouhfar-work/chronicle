import { MovieTrackingStatus, ShowTrackingStatus } from '../../../../generated/prisma/enums';
import { MediaStatusFilter } from '@/features/library';

export const movieTrackingStatusMap = {
  watching: ShowTrackingStatus.WATCHING,
  completed: ShowTrackingStatus.COMPLETED,
  plan_to_watch: MovieTrackingStatus.PLAN_TO_WATCH,
} satisfies Record<Exclude<MediaStatusFilter, 'all' | 'dropped'>, MovieTrackingStatus>;
