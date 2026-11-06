import { fetchSimilarRaw } from '@/modules/media/queries/fetchSimilarRaw';
import { attachTrackedFlags } from '@/modules/media/queries/attachTrackedFlags';
import { mapSimilarShows } from '@/modules/show/mappers/mapSimilarShows';
import type { SimilarShow, SimilarShowRaw } from '@/modules/show/types/similarShow';
import { getTrackedShowsLookup } from '@/modules/show/services/getTrackedShowsLookup';

export const getSimilarShows = async (id: string): Promise<SimilarShow[]> => {
  try {
    const { results, genreDictionary } = await fetchSimilarRaw<SimilarShowRaw>('tv', id);
    const mapped = mapSimilarShows(results, genreDictionary);

    return attachTrackedFlags(mapped, getTrackedShowsLookup);
  } catch {
    return [];
  }
};
