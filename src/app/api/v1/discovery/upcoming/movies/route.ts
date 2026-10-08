import { apiError, apiOk, requireApiTokenOr428, requireApiUserId } from '@/modules/api/respond';
import { getUpcomingMovies } from '@/modules/movie/queries/getUpcomingMovies';

export const GET = async (req: Request) => {
  try {
    const userId = await requireApiUserId();
    const missing = await requireApiTokenOr428(userId);
    if (missing) return missing;
    const daysParam = new URL(req.url).searchParams.get('days');
    const days = daysParam === null ? undefined : Number(daysParam);
    return apiOk({ movies: await getUpcomingMovies(days === undefined ? {} : { days }) });
  } catch (error) {
    return apiError(error);
  }
};
