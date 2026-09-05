import { prisma } from '@/lib/prisma';
import { mapUpNextEpisodes } from '@/features/episode/mappers/mapUpNextEpisodes';
import { MappedUpNextEpisode, UpNextEpisode } from '@/features/episode/types/upNextEpisode';
import { getFreshTrackedShow } from '@/features/show/queries/getFreshTrackedShow';

export const getUpNextEpisodes = async (): Promise<MappedUpNextEpisode[]> => {
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

  const result: UpNextEpisode[] = Array.from(upNextEpisodes.values());

  return mapUpNextEpisodes(result);
};
