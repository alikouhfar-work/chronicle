import { tmdbFetch } from '@/utils/tmdbFetch';
import { mapCredits } from '@/features/credit/mappers/mapCredits';
import { Credits, CreditsRaw } from '@/features/credit';

export const getShowCredits = async (id: string): Promise<Credits | null> => {
  try {
    const credits = await tmdbFetch<CreditsRaw>(`tv/${id}/credits`, {
      next: {
        revalidate: 86400,
      },
    });

    return mapCredits(credits);
  } catch (error) {
    console.error('Failed to fetch show credits:', error);
    return null;
  }
};
