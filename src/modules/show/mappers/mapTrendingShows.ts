import { mapTrending as mapTrendingBase } from '@/modules/media/mappers/mediaMappers';
import type { TrendingShow } from '@/modules/show/types/trendingShow';
import type { TrendingShowRaw } from '@/modules/show';

export const mapTrendingShows = (
  trendingShows: TrendingShowRaw[],
  genreDictionary: Map<number, string>,
): Omit<TrendingShow, 'isTracked'>[] =>
  mapTrendingBase(trendingShows, genreDictionary, 'tv') as Omit<TrendingShow, 'isTracked'>[];
