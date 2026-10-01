import { addDays } from 'date-fns';
import { prisma } from '@/infra/db/prisma';
import { GetUpcomingMediaOptions } from '@/modules/library/types/getUpcomingMedia';
import { mapUpcomingEpisodes } from '@/modules/episode-season/mappers/mapUpcomingEpisodes';
import { getFreshTrackedShows } from '@/modules/show/queries/getFreshTrackedShows';
import { DatabaseError, NotFoundError, ValidationError } from '@/shared/lib/errors';
import { parseWindowDays } from '@/shared/lib/validate';
import { ShowTrackingStatus } from '../../../../generated/prisma/enums';

export const getUpcomingEpisodes = async (options: GetUpcomingMediaOptions = {}) => {
  try {
    const days = parseWindowDays(options.days);

    try {
      await getFreshTrackedShows();
    } catch {
    }

    const now = new Date();
    const futureDate = addDays(now, days);

    const episodes = await prisma.episode.findMany({
      where: {
        airDate: { gt: now, lte: futureDate },
        season: {
          seasonNumber: { gt: 0 },
          show: {
            tracking: {
              status: { in: [ShowTrackingStatus.WATCHING, ShowTrackingStatus.PLAN_TO_WATCH] },
            },
          },
        },
      },
      include: { tracking: true, season: { include: { show: true } } },
      orderBy: [{ airDate: 'asc' }, { episodeNumber: 'asc' }],
    });

    return mapUpcomingEpisodes(episodes);
  } catch (error) {
    if (error instanceof ValidationError || error instanceof NotFoundError) throw error;
    throw new DatabaseError('Failed to load upcoming episodes', { cause: error });
  }
};
