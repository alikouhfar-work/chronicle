import { TrackedShow } from '@/features/show';
import { TrackedMovie } from '@/features/movie';

export type DashboardHeaderProps = {
  shows: TrackedShow[];
  movies: TrackedMovie[];
};

export type DashboardHeaderWatchStatsProps = {
  shows: TrackedShow[];
  movies: TrackedMovie[];
};
