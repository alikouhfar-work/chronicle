import { GenreRaw } from '@/features/genre';

export type ShowSearchResultRaw = {
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

export type ShowSearchResult = {
  adult: boolean;
  backdropPath: string;
  id: number;
  name: string;
  overview: string;
  posterPath: string;
  mediaType: 'tv';
  genres: GenreRaw[];
  firstAirDate: string;
  voteAverage: number;
  originCountry: string[];
  originalLanguage: string;
  isTracked: boolean;
};
