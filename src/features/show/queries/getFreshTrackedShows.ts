import { prisma } from '@/lib/prisma';
import { getFreshTrackedShow } from '@/features/show/queries/getFreshTrackedShow';

export const getFreshTrackedShows = async (): Promise<void> => {
  const watchingShows = await prisma.show.findMany({
    where: {
      tracking: {
        status: 'WATCHING',
      },
    },
    select: {
      tmdbId: true,
    },
  });

  await Promise.all(watchingShows.map(({ tmdbId }) => getFreshTrackedShow(tmdbId.toString())));
};
