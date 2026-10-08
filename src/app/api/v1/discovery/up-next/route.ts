import { apiError, apiOk, requireApiTokenOr428, requireApiUserId } from '@/modules/api/respond';
import { getUpNextEpisodes } from '@/modules/episode-season/queries/getUpNextEpisodes';

export const GET = async () => {
  try {
    const userId = await requireApiUserId();
    const missing = await requireApiTokenOr428(userId);
    if (missing) return missing;
    return apiOk({ episodes: await getUpNextEpisodes() });
  } catch (error) {
    return apiError(error);
  }
};
