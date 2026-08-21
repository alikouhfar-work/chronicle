import { tmdbFetch } from '@/utils/tmdbFetch';
import { getTrackedShowsLookup, mapTrendingShows } from '@/features/show';
import { getGenreDictionary } from '@/features/genre';
import { GetTrendingShowsResponse } from '@/features/show/types/getTrendingShows';
import { TrendingShow } from '@/features/show/types/trending';

export const getShowCast = async (tmdbId: number) => {
  try {
    const cast = await tmdbFetch<GetTrendingShowsResponse>(`tv/${tmdbId}/credits`, {
      next: {
        revalidate: 86400,
      },
    });

    // const results = mapTrendingShows(trendingShows.results, genreDictionary);
    //
    // const showTmdbIds = results.map((result) => result.id);
    //
    // const trackedShowsLookup = await getTrackedShowsLookup(showTmdbIds);
    //
    // return results.map((show) => ({
    //   ...show,
    //   isTracked: trackedShowsLookup.has(show.id),
    // }));
  } catch (error) {
    console.error('Failed to fetch trending shows:', error);
    return [];
  }
};
