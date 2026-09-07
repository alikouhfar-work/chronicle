import { tmdbFetch } from '@/utils/tmdbFetch';
import { getGenreDictionary } from '@/features/genre';
import { GetSimilarShowsResponse } from '@/features/show/types/getSimilarShows';
import { mapSimilarShows } from '@/features/show/mappers/mapSimilarShows';
import { SimilarShow } from '@/features/show/types/similarShow';
import { getTrackedShowsLookup } from '@/features/show';

export const getSimilarShows = async (id: string): Promise<SimilarShow[]> => {
  try {
    const [similarShows, genreDictionary] = await Promise.all([
      tmdbFetch<GetSimilarShowsResponse>(`tv/${id}/similar`, {
        next: {
          revalidate: 86400,
        },
      }),
      getGenreDictionary(),
    ]);

    const results = mapSimilarShows(similarShows.results, genreDictionary);

    const showTmdbIds = results.map((result) => result.id);

    const trackedShowsLookup = await getTrackedShowsLookup(showTmdbIds);

    return results.map((show) => ({
      ...show,
      isTracked: trackedShowsLookup.has(show.id),
    }));
  } catch (error) {
    console.error('Failed to fetch similar shows:', error);
    return [];
  }
};
