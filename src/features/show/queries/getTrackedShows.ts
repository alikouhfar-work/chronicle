import { prisma } from '@/lib/prisma';
import { TrackedShow } from '@/features/show';
import { MediaSortFilter, MediaStatusFilter } from '@/features/library';
import { showTrackingStatusMap } from '@/features/show/utils/trackingStatusMap';
import { showSortMap } from '@/features/show/utils/sortMap';

export const getTrackedShows = async (
  sort?: MediaSortFilter,
  status?: MediaStatusFilter,
  search?: string,
): Promise<TrackedShow[]> => {
  const filteredStatus = status && status !== 'all' ? showTrackingStatusMap[status] : undefined;
  const sortBy = sort ? showSortMap[sort] : 'createdAt';

  return prisma.show.findMany({
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
      seasons: {
        include: {
          episodes: {
            include: {
              tracking: true,
            },
          },
        },
      },
    },
    orderBy: {
      [sortBy]: 'desc',
    },
  });
};
