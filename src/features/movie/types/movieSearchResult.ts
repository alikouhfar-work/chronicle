import { GenreRaw } from '@/features/genre';

export type MovieSearchResultRaw = {
  adult: boolean;
  backdrop_path: string;
  id: number;
  title: string;
  original_language: string;
  original_title: string;
  overview: string;
  poster_path: string;
  media_type: 'movie';
  genre_ids: number[];
  popularity: number;
  release_date: string;
  video: boolean;
  vote_average: number;
  vote_count: number;
};

export type MovieSearchResult = {
  adult: boolean;
  backdropPath: string;
  id: number;
  name: string;
  overview: string;
  posterPath: string;
  mediaType: 'movie';
  genres: GenreRaw[];
  releaseDate: string;
  voteAverage: number;
  originalLanguage: string;
  isTracked: boolean;
};
