import { tmdbFetch } from '@/infra/tmdb/client';
import { getGenreDictionary } from '@/modules/discovery/genre';
import { GetCombinedCreditsResponse } from '@/modules/discovery/person/types/getCombinedCredits';
import { CombinedCredit } from '@/modules/discovery/person/types/combinedCredit';
import { mapCombinedCredits } from '@/modules/discovery/person/mappers/mapCombinedCredits';
import { getTrackedMoviesLookup } from '@/modules/movie/queries/getTrackedMoviesLookup';
import { getTrackedShowsLookup } from '@/modules/show/queries/getTrackedShowsLookup';

export const getCombinedCredits = async (id: string): Promise<CombinedCredit[]> => {
  try {
    const [combinedCredits, genreDictionary] = await Promise.all([
      tmdbFetch<GetCombinedCreditsResponse>(`person/${id}/combined_credits`, {
        next: {
          revalidate: 604800,
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
  } catch {{
    return [];
  }}
};