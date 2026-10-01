import { TrendingMovieRaw } from '@/modules/movie';

export type GetTrendingMoviesResponse = {
  results: TrendingMovieRaw[];
};
