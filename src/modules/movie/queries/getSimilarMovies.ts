import { fetchSimilarRaw } from '@/modules/media/queries/fetchSimilarRaw';
import { attachTrackedFlags } from '@/modules/media/queries/attachTrackedFlags';
import { mapSimilarMovies } from '@/modules/movie/mappers/mapSimilarMovies';
import { SimilarMovie, SimilarMovieRaw } from '@/modules/movie/types/similarMovie';
import { getTrackedMoviesLookup } from '@/modules/movie/services/getTrackedMoviesLookup';

export const getSimilarMovies = async (id: string): Promise<SimilarMovie[]> => {
  try {
    const { results, genreDictionary } = await fetchSimilarRaw<SimilarMovieRaw>('movie', id);
    const mapped = mapSimilarMovies(results, genreDictionary);

    return attachTrackedFlags(mapped, getTrackedMoviesLookup);
  } catch {
    return [];
  }
};
