import { GenreRaw } from '@/features/genre';

export type SimilarMovieRaw = {
  backdrop_path: string,
  genre_ids: number[],
  id: number,
  original_language: string,
  original_title: string,
  overview: string,
  popularity: number,
  poster_path: string,
  release_date: string,
  title: string,
  video: boolean,
  vote_average: number,
  vote_count: number
};

export type SimilarMovie = {
  backdropPath: string;
  id: number;
  name: string;
  overview: string;
  mediaType: 'tv';
  genres: GenreRaw[];
  releaseDate: string;
  isTracked: boolean;
};
