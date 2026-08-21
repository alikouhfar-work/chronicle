import { TrackedShow } from '@/features/show';
import { TrackedMovie } from '@/features/movie';
import { TrendingMedia } from '@/types/trending';

export interface DashboardProps {
  shows: TrackedShow[];
  movies: TrackedMovie[];
  trendingMovies: TrendingMedia[];
  trendingShows: TrendingMedia[];
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
