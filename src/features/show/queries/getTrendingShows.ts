import { tmdbFetch } from '@/utils/tmdbFetch';
import { getTrackedShowsLookup, mapTrendingShows } from '@/features/show';
import { getGenreDictionary } from '@/features/genre';
import { GetTrendingShowsResponse } from '@/features/show/types/getTrendingShows';
import { TrendingShow } from '@/features/show/types/trending';

export const getTrendingShows = async (): Promise<TrendingShow[]> => {
  try {
    const [trendingShows, genreDictionary] = await Promise.all([
      tmdbFetch<GetTrendingShowsResponse>('trending/tv/week', {
        next: {
          revalidate: 86400,
        },
      }),
      getGenreDictionary(),
    ]);

    const results = mapTrendingShows(trendingShows.results, genreDictionary);

    const showTmdbIds = results.map((result) => result.id);

    const trackedShowsLookup = await getTrackedShowsLookup(showTmdbIds);

    return results.map((show) => ({
      ...show,
      isTracked: trackedShowsLookup.has(show.id),
    }));
  } catch (error) {
    console.error('Failed to fetch trending shows:', error);
    return [];
  }
};
