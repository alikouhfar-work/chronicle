import { apiError, apiOk, requireApiUserId } from '@/modules/api/respond';
import { getTrackedShows } from '@/modules/show/queries/getTrackedShows';
import type { MediaSortFilter, MediaStatusFilter } from '@/modules/media/entities';

export const GET = async (req: Request) => {
  try {
    await requireApiUserId();
    const params = new URL(req.url).searchParams;
    const shows = await getTrackedShows(
      (params.get('sort') ?? undefined) as MediaSortFilter | undefined,
      (params.get('status') ?? undefined) as MediaStatusFilter | undefined,
      params.get('search') ?? undefined,
    );
    return apiOk({ shows });
  } catch (error) {
    return apiError(error);
  }
};
