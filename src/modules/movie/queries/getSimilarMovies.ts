import { fetchSimilarRaw, withTrackedFlags } from '@/modules/media/queries';
import { mapSimilarMovies } from '@/modules/movie/mappers/mapSimilarMovies';
import { SimilarMovie, SimilarMovieRaw } from '@/modules/movie/types/similarMovie';
import { getTrackedMoviesLookup } from '@/modules/movie/queries/getTrackedMoviesLookup';

export const getSimilarMovies = async (id: string): Promise<SimilarMovie[]> => {
  try {
    const { results, genreDictionary } = await fetchSimilarRaw<SimilarMovieRaw>('movie', id);
    const mapped = mapSimilarMovies(results, genreDictionary);

    return withTrackedFlags(mapped, getTrackedMoviesLookup);
  } catch {
    return [];
  }
};
