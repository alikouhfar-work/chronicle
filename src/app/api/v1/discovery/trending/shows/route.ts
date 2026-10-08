import { apiError, apiOk, requireApiTokenOr428, requireApiUserId } from '@/modules/api/respond';
import { getTrendingShows } from '@/modules/show/queries/getTrendingShows';

export const GET = async () => {
  try {
    const userId = await requireApiUserId();
    const missing = await requireApiTokenOr428(userId);
    if (missing) return missing;
    return apiOk({ shows: await getTrendingShows() });
  } catch (error) {
    return apiError(error);
  }
};
