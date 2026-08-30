import { TrackedMovie } from '@/features/movie';
import { prisma } from '@/lib/prisma';
import { MediaSortFilter, MediaStatusFilter } from '@/features/library';
import { movieTrackingStatusMap } from '@/features/movie/utils/trackingStatusMap';
import { movieSortMap } from '@/features/movie/utils/sortMap';

export const getTrackedMovies = async (
  sort?: MediaSortFilter,
  status?: MediaStatusFilter,
  search?: string,
): Promise<TrackedMovie[]> => {
  const filteredStatus =
    status && status !== 'all' && status !== 'dropped' ? movieTrackingStatusMap[status] : undefined;
  const sortBy = sort ? movieSortMap[sort] : 'createdAt';

  return prisma.movie.findMany({
    where: {
      ...(filteredStatus
        ? {
            tracking: {
              status: filteredStatus,
            },
          }
        : {}),
      ...(search
        ? {
            name: {
              contains: search,
              mode: 'insensitive',
            },
          }
        : {}),
    },
    include: {
      genres: true,
      tracking: true,
    },
    orderBy: {
      [sortBy]: 'desc',
    },
  });
};
