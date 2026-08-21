import { TrackedShow } from '@/features/show';
import { TrackedMovie } from '@/features/movie';

export type DashboardHeaderWatchStatsProps = {
  trackedShows: TrackedShow[];
  trackedMovies: TrackedMovie[];
};
