import type { TrackedShow } from '@/modules/show';
import type { TrackedMovie } from '@/modules/movie';

export type DashboardHeaderWatchStatsProps = {
  trackedShows: TrackedShow[];
  trackedMovies: TrackedMovie[];
};
