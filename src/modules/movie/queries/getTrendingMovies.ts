import { fetchTrendingRaw, withTrackedFlags } from '@/modules/media/queries/mediaQueries';
import { mapTrendingMovies } from '@/modules/movie/mappers/mapTrendingMovies';
import { TrendingMovie, TrendingMovieRaw } from '@/modules/movie/types/trending';
import { getTrackedMoviesLookup } from '@/modules/movie/services/getTrackedMoviesLookup';

export const getTrendingMovies = async (): Promise<TrendingMovie[]> => {
  try {
    const { results, genreDictionary } = await fetchTrendingRaw<TrendingMovieRaw>('movie');
    const mapped = mapTrendingMovies(results, genreDictionary);

    return withTrackedFlags(mapped, getTrackedMoviesLookup);
  } catch {
    return [];
  }
};
