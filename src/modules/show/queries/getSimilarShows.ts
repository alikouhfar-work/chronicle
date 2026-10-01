import { fetchSimilarRaw, withTrackedFlags } from '@/modules/media/queries';
import { mapSimilarShows } from '@/modules/show/mappers/mapSimilarShows';
import { SimilarShow, SimilarShowRaw } from '@/modules/show/types/similarShow';
import { getTrackedShowsLookup } from '@/modules/show/queries/getTrackedShowsLookup';

export const getSimilarShows = async (id: string): Promise<SimilarShow[]> => {
  try {
    const { results, genreDictionary } = await fetchSimilarRaw<SimilarShowRaw>('tv', id);
    const mapped = mapSimilarShows(results, genreDictionary);

    return withTrackedFlags(mapped, getTrackedShowsLookup);
  } catch {
    return [];
  }
};
