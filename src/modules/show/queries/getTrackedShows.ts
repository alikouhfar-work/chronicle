import { prisma } from '@/infra/db/prisma';
import { requireUserId } from '@/infra/tmdb/forUser';
import { TrackedShow } from '@/modules/show';
import { MediaSortFilter, MediaStatusFilter } from '@/modules/media/entities';
import { showTrackingStatusMap } from '@/modules/show/utils/trackingStatusMap';
import { showSortMap } from '@/modules/show/utils/sortMap';
import { DatabaseError, NotFoundError, ValidationError } from '@/shared/lib/errors';

const DEFAULT_SORT: MediaSortFilter = 'recent';

const resolveStatus = (status?: MediaStatusFilter) => {
  if (!status || status === 'all') return undefined;
  return showTrackingStatusMap[status];
};

const resolveSort = (sort?: MediaSortFilter): string =>
  sort && sort in showSortMap ? showSortMap[sort] : showSortMap[DEFAULT_SORT];

export const getTrackedShows = async (
  sort?: MediaSortFilter,
  status?: MediaStatusFilter,
  search?: string,
): Promise<TrackedShow[]> => {
  try {
    const userId = await requireUserId();
    const filteredStatus = resolveStatus(status);
    const sortBy = resolveSort(sort);

    return await prisma.show.findMany({
      where: {
        userId,
        ...(filteredStatus ? { tracking: { status: filteredStatus } } : {}),
        ...(search ? { name: { contains: search, mode: 'insensitive' } } : {}),
      },
      include: {
        genres: true,
        tracking: true,
        seasons: { include: { episodes: { include: { tracking: true } } } },
      },
      orderBy: { [sortBy]: 'desc' },
    });
  } catch (error) {
    if (error instanceof ValidationError || error instanceof NotFoundError) throw error;
    throw new DatabaseError('Failed to load tracked shows', { cause: error });
  }
};
