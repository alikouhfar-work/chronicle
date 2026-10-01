import { prisma } from '@/infra/db/prisma';
import { mapUpNextEpisodes } from '@/modules/episode-season/mappers/mapUpNextEpisodes';
import { MappedUpNextEpisode, UpNextEpisode } from '@/modules/episode-season/types/upNextEpisode';
import { getFreshTrackedShows } from '@/modules/show/queries/getFreshTrackedShows';
import { DatabaseError } from '@/shared/lib/errors';

export const getUpNextEpisodes = async (): Promise<MappedUpNextEpisode[]> => {
  try {
    try {
      await getFreshTrackedShows();
    } catch {
      // Best-effort refresh: fall through to cached data on failure.
    }

    const now = new Date();

    const episodes = await prisma.episode.findMany({
      where: {
        airDate: { lte: now },
        season: {
          seasonNumber: { gt: 0 },
          show: { tracking: { status: 'WATCHING' } },
        },
      },
      include: { tracking: true, season: { include: { show: true } } },
      orderBy: [
        { season: { showId: 'asc' } },
        { season: { seasonNumber: 'asc' } },
        { episodeNumber: 'asc' },
      ],
    });

    const upNextEpisodes = new Map<string, (typeof episodes)[number]>();

    for (const episode of episodes) {
      const showId = episode.season.showId;
      if (upNextEpisodes.has(showId)) continue;
      if (episode.tracking?.watched) continue;
      upNextEpisodes.set(showId, episode);
    }

    const result: UpNextEpisode[] = Array.from(upNextEpisodes.values());

    return mapUpNextEpisodes(result);
  } catch (error) {
    throw new DatabaseError('Failed to load up-next episodes', { cause: error });
  }
};
