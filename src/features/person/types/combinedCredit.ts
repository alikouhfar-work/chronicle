import { GenreRaw } from '@/features/genre';

export type CombinedCreditRaw = CreditShowRaw | CreditMovieRaw;

export type CreditMovieRaw = {
  backdrop_path: string;
  genre_ids: number[];
  id: number;
  original_language: string;
  original_title: string;
  overview: string;
  popularity: number;
  poster_path: string;
  release_date: string;
  title: string;
  video: boolean;
  vote_average: number;
  vote_count: number;
  character: string;
  credit_id: string;
  order: number;
  media_type: 'movie';
};

export type CreditShowRaw = {
  backdrop_path: string;
  genre_ids: number[];
  id: number;
  origin_country: string[];
  original_language: string;
  original_name: string;
  overview: string;
  popularity: number;
  poster_path: string;
  first_air_date: string;
  softcore: boolean;
  name: string;
  vote_average: number;
  vote_count: number;
  character: string;
  credit_id: string;
  episode_count: number;
  first_credit_air_date: string;
  media_type: 'tv';
};

export type CombinedCredit = {
  genres: GenreRaw[];
  id: number;
  overview: string;
  popularity: number;
  posterPath: string;
  releaseDate: string;
  name: string;
  rating: number;
  voteCount: number;
  character: string;
  creditId: string;
  mediaType: string;
  isTracked: boolean;
};
