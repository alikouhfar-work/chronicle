import { tmdbFetch } from '@/utils/tmdbFetch';
import { getGenreDictionary } from '@/features/genre';
import { getTrackedShowsLookup } from '@/features/show';
import { GetCombinedCreditsResponse } from '@/features/person/types/getCombinedCredits';
import { CombinedCredit } from '@/features/person/types/combinedCredit';
import { mapCombinedCredits } from '@/features/person/mappers/mapCombinedCredits';

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

    const showTmdbIds = results.map((result) => result.id);

    const trackedShowsLookup = await getTrackedShowsLookup(showTmdbIds);

    return results.map((show) => ({
      ...show,
      isTracked: trackedShowsLookup.has(show.id),
    }));
  } catch (error) {
    console.error('Failed to fetch combined credits:', error);
    return [];
  }
};
