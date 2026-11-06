import { fetchTrendingRaw } from '@/modules/media/queries/fetchTrendingRaw';
import { attachTrackedFlags } from '@/modules/media/queries/attachTrackedFlags';
import { mapTrendingMovies } from '@/modules/movie/mappers/mapTrendingMovies';
import type { TrendingMovie, TrendingMovieRaw } from '@/modules/movie/types/trending';
import { getTrackedMoviesLookup } from '@/modules/movie/services/getTrackedMoviesLookup';

export const getTrendingMovies = async (): Promise<TrendingMovie[]> => {
  try {
    const { results, genreDictionary } = await fetchTrendingRaw<TrendingMovieRaw>('movie');
    const mapped = mapTrendingMovies(results, genreDictionary);

    return attachTrackedFlags(mapped, getTrackedMoviesLookup);
  } catch {
    return [];
  }
};
