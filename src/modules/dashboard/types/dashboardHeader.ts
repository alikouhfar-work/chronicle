import { TrackedShow } from '@/modules/show';
import { TrackedMovie } from '@/modules/movie';

export type DashboardHeaderWatchStatsProps = {
  trackedShows: TrackedShow[];
  trackedMovies: TrackedMovie[];
};
