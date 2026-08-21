import { GenreRaw } from '@/features/genre';
import { MappedUpcomingEpisode } from '@/features/episode/types/upcomingEpisode';

export type TrendingShowRaw = {
  adult: boolean;
  backdrop_path: string;
  id: number;
  name: string;
  original_language: string;
  original_name: string;
  overview: string;
  poster_path: string;
  media_type: 'tv';
  genre_ids: number[];
  popularity: number;
  first_air_date: string;
  vote_average: number;
  vote_count: number;
  origin_country: string[];
};

export type TrendingShow = {
  backdropPath: string;
  id: number;
  name: string;
  overview: string;
  mediaType: 'tv';
  genres: GenreRaw[];
  releaseDate: string;
  rating: number;
  voteCount: number;
  isTracked: boolean;
};
