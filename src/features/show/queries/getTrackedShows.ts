import { prisma } from '@/lib/prisma';
import { TrackedShow } from '@/features/show';
import { MediaSortFilter, MediaStatusFilter } from '@/features/library';
import { showTrackingStatusMap } from '@/features/show/utils/trackingStatusMap';
import { showSortMap } from '@/features/show/utils/sortMap';

export const getTrackedShows = async (
  sort?: MediaSortFilter,
  status?: MediaStatusFilter,
): Promise<TrackedShow[]> => {
  const filteredStatus = status && status !== 'all' ? showTrackingStatusMap[status] : undefined;
  const [sortBy, sortOrder] = sort ? showSortMap[sort].split(':') : ['createdAt', 'desc'];

  return prisma.show.findMany({
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
      [sortBy]: sortOrder,
    },
  });
};
