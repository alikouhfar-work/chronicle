import { GenreRaw } from '@/features/genre';

export type TrendingMovieRaw = {
  adult: boolean;
  backdrop_path: string;
  id: number;
  title: string;
  original_title: string;
  overview: string;
  poster_path: string;
  media_type: 'movie';
  original_language: string;
  genre_ids: number[];
  popularity: number;
  release_date: string;
  softcore: boolean;
  video: boolean;
  vote_average: number;
  vote_count: number;
};

export type TrendingMovie = {
  backdropPath: string;
  id: number;
  name: string;
  overview: string;
  mediaType: 'movie';
  genres: GenreRaw[];
  releaseDate: string;
  rating: number;
  voteCount: number;
  isTracked: boolean;
};
