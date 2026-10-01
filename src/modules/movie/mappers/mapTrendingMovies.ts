import { mapTrending as mapTrendingBase } from '@/modules/media/mappers';
import type { TrendingMovie, TrendingMovieRaw } from '@/modules/movie';

export const mapTrendingMovies = (
  trendingMovies: TrendingMovieRaw[],
  genreDictionary: Map<number, string>,
): Omit<TrendingMovie, 'isTracked'>[] =>
  mapTrendingBase(trendingMovies, genreDictionary, 'movie') as Omit<
    TrendingMovie,
    'isTracked'
  >[];
