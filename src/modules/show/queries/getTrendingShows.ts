import { fetchTrendingRaw } from '@/modules/media/queries/fetchTrendingRaw';
import { attachTrackedFlags } from '@/modules/media/queries/attachTrackedFlags';
import { mapTrendingShows } from '@/modules/show/mappers/mapTrendingShows';
import type { TrendingShow, TrendingShowRaw } from '@/modules/show/types/trendingShow';
import { getTrackedShowsLookup } from '@/modules/show/services/getTrackedShowsLookup';

export const getTrendingShows = async (): Promise<TrendingShow[]> => {
  try {
    const { results, genreDictionary } = await fetchTrendingRaw<TrendingShowRaw>('tv');
    const mapped = mapTrendingShows(results, genreDictionary);

    return attachTrackedFlags(mapped, getTrackedShowsLookup);
  } catch {
    return [];
  }
};
