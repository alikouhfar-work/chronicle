import { TrackedShow, TrendingShow } from '@/features/show';
import { TrackedMovie } from '@/features/movie';

export interface DashboardProps {
  shows: TrackedShow[];
  movies: TrackedMovie[];
  trendingMovies: TrackedMovie[];
  trendingShows: TrendingShow[];
  upcomingEvents: UpcomingEvent[];
}

export interface UpcomingEvent {
  parentTitle: string;
  parentType: 'show' | 'movie';
  title: string;
  releaseType: 'new_season' | 'new_episode' | 'sequel' | 'spin_off';
  releaseDate: string;
  synopsis: string;
  isConfirmed: boolean;
  anticipationScore: number;
}

export interface UpNextItem {
  show: TrackedShow;
  seasonNumber: number;
  episodeNumber: number;
  title: string;
  airDate?: string;
  overview?: string;
}
