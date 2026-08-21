import { TrackedMovie } from '@/features/movie';
import { prisma } from '@/lib/prisma';
import { MediaSortFilter, MediaStatusFilter } from '@/features/library';
import { movieTrackingStatusMap } from '@/features/movie/utils/trackingStatusMap';
import { movieSortMap } from '@/features/movie/utils/sortMap';

export const getTrackedMovies = async (
  sort?: MediaSortFilter,
  status?: MediaStatusFilter,
): Promise<TrackedMovie[]> => {
  const filteredStatus =
    status && status !== 'all' && status !== 'dropped' ? movieTrackingStatusMap[status] : undefined;
  const [sortBy, sortOrder] = sort ? movieSortMap[sort].split(':') : ['createdAt', 'desc'];

  return prisma.movie.findMany({
    where: {
      ...(filteredStatus
        ? {
            tracking: {
              status: filteredStatus,
            },
          }
        : {}),
    },
    include: {
      genres: true,
      tracking: true,
    },
    orderBy: {
      [sortBy]: sortOrder,
    },
  });
};
