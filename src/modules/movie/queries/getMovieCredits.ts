import { fetchCredits } from '@/modules/media/queries';
import { Credits } from '@/modules/discovery/credit';

export const getMovieCredits = async (id: string): Promise<Credits | null> => {
  try {
    return await fetchCredits('movie', id);
  } catch {
    return null;
  }
};
