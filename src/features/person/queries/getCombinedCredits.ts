import { tmdbFetch } from '@/utils/tmdbFetch';
import { getGenreDictionary } from '@/features/genre';
import { getTrackedShowsLookup } from '@/features/show';
import { GetCombinedCreditsResponse } from '@/features/person/types/getCombinedCredits';
import { CombinedCredit } from '@/features/person/types/combinedCredit';
import { mapCombinedCredits } from '@/features/person/mappers/mapCombinedCredits';
import { getTrackedMoviesLookup } from '@/features/movie/queries/getTrackedMoviesLookup';

export const getCombinedCredits = async (id: string): Promise<CombinedCredit[]> => {
  try {
    const [combinedCredits, genreDictionary] = await Promise.all([
      tmdbFetch<GetCombinedCreditsResponse>(`person/${id}/combined_credits`, {
        next: {
          revalidate: 86400,
        },
      }),
      getGenreDictionary(),
    ]);

    const results = mapCombinedCredits(combinedCredits.cast, genreDictionary);

    const movieTmdbIds = results
      .filter((result) => result.mediaType === 'movie')
      .map((result) => result.id);

    const showTmdbIds = results
      .filter((result) => result.mediaType === 'tv')
      .map((result) => result.id);

    const [trackedMoviesLookup, trackedShowsLookup] = await Promise.all([
      getTrackedMoviesLookup(movieTmdbIds),
      getTrackedShowsLookup(showTmdbIds),
    ]);

    return results.map((result) => ({
      ...result,
      isTracked:
        result.mediaType === 'movie'
          ? trackedMoviesLookup.has(result.id)
          : trackedShowsLookup.has(result.id),
    }));
  } catch (error) {
    console.error('Failed to fetch combined credits:', error);
    return [];
  }
};
