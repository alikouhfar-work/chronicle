import { prisma } from '@/lib/prisma';
import { EpisodeRaw } from '@/features/episode';

export const getUpNextEpisodes = async (): Promise<EpisodeRaw[]> => {
  const now = new Date();

  const episodes = await prisma.episode.findMany({
    where: {
      airDate: {
        lte: now,
      },
      season: {
        seasonNumber: {
          gt: 0,
        },
        show: {
          tracking: {
            status: 'WATCHING',
          },
        },
      },
    },
    include: {
      tracking: true,
      season: {
        include: {
          show: true,
        },
      },
    },
    orderBy: [
      {
        season: {
          showId: 'asc',
        },
      },
      {
        season: {
          seasonNumber: 'asc',
        },
      },
      {
        episodeNumber: 'asc',
      },
    ],
  });

  const upNextEpisodes = new Map<string, (typeof episodes)[number]>();

  for (const episode of episodes) {
    const showId = episode.season.showId;

    if (upNextEpisodes.has(showId)) {
      continue;
    }

    if (episode.tracking?.watched) {
      continue;
    }

    upNextEpisodes.set(showId, episode);
  }

  return Array.from(upNextEpisodes.values());
};
