import { fetchTrendingRaw, withTrackedFlags } from '@/modules/media/queries/mediaQueries';
import { mapTrendingShows } from '@/modules/show/mappers/mapTrendingShows';
import { TrendingShow, TrendingShowRaw } from '@/modules/show/types/trendingShow';
import { getTrackedShowsLookup } from '@/modules/show/services/getTrackedShowsLookup';

export const getTrendingShows = async (): Promise<TrendingShow[]> => {
  try {
    const { results, genreDictionary } = await fetchTrendingRaw<TrendingShowRaw>('tv');
    const mapped = mapTrendingShows(results, genreDictionary);

    return withTrackedFlags(mapped, getTrackedShowsLookup);
  } catch {
    return [];
  }
};
