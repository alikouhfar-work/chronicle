import { fetchCredits } from '@/modules/media/queries';
import { Credits } from '@/modules/discovery/credit';

export const getShowCredits = async (id: string): Promise<Credits | null> => {
  try {
    return await fetchCredits('tv', id);
  } catch {
    return null;
  }
};
