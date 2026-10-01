import { TrackedMovie } from '@/modules/movie';
import { prisma } from '@/infra/db/prisma';
import { MediaSortFilter, MediaStatusFilter } from '@/modules/media/entities';
import { movieTrackingStatusMap } from '@/modules/movie/utils/trackingStatusMap';
import { movieSortMap } from '@/modules/movie/utils/sortMap';
import { DatabaseError, NotFoundError, ValidationError } from '@/shared/lib/errors';

const DEFAULT_SORT: MediaSortFilter = 'recent';

const resolveStatus = (status?: MediaStatusFilter) => {
  if (!status || status === 'all') return undefined;
  // Movies have no DROPPED state by design; filtering by it matches nothing.
  if (status === 'dropped') return 'none' as const;
  return movieTrackingStatusMap[status];
};

const resolveSort = (sort?: MediaSortFilter): string =>
  sort && sort in movieSortMap ? movieSortMap[sort] : movieSortMap[DEFAULT_SORT];

export const getTrackedMovies = async (
  sort?: MediaSortFilter,
  status?: MediaStatusFilter,
  search?: string,
): Promise<TrackedMovie[]> => {
  try {
    const filteredStatus = resolveStatus(status);
    if (filteredStatus === 'none') return [];
    const sortBy = resolveSort(sort);

    return await prisma.movie.findMany({
      where: {
        ...(filteredStatus ? { tracking: { status: filteredStatus } } : {}),
        ...(search ? { name: { contains: search, mode: 'insensitive' } } : {}),
      },
      include: { genres: true, tracking: true },
      orderBy: { [sortBy]: 'desc' },
    });
  } catch (error) {
    if (error instanceof ValidationError || error instanceof NotFoundError) throw error;
    throw new DatabaseError('Failed to load tracked movies', { cause: error });
  }
};
