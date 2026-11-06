import { MovieTrackingStatus } from '../../../../generated/prisma/enums';
import type { MediaStatusFilter } from '@/modules/media/types/media';

export const movieTrackingStatusMap = {
  watching: MovieTrackingStatus.WATCHING,
  completed: MovieTrackingStatus.COMPLETED,
  plan_to_watch: MovieTrackingStatus.PLAN_TO_WATCH,
} satisfies Record<Exclude<MediaStatusFilter, 'all' | 'dropped'>, MovieTrackingStatus>;
