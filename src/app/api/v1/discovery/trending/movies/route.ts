import { apiError, apiOk, requireApiTokenOr428, requireApiUserId } from '@/modules/api/respond';
import { getTrendingMovies } from '@/modules/movie/queries/getTrendingMovies';

export const GET = async () => {
  try {
    const userId = await requireApiUserId();
    const missing = await requireApiTokenOr428(userId);
    if (missing) return missing;
    return apiOk({ movies: await getTrendingMovies() });
  } catch (error) {
    return apiError(error);
  }
};
