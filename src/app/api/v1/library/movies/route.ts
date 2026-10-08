import { apiError, apiOk, requireApiUserId } from '@/modules/api/respond';
import { getTrackedMovies } from '@/modules/movie/queries/getTrackedMovies';
import type { MediaSortFilter, MediaStatusFilter } from '@/modules/media/entities';

export const GET = async (req: Request) => {
  try {
    await requireApiUserId();
    const params = new URL(req.url).searchParams;
    const movies = await getTrackedMovies(
      (params.get('sort') ?? undefined) as MediaSortFilter | undefined,
      (params.get('status') ?? undefined) as MediaStatusFilter | undefined,
      params.get('search') ?? undefined,
    );
    return apiOk({ movies });
  } catch (error) {
    return apiError(error);
  }
};
