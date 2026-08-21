import { TrackedShow } from '@/features/show';
import { ShowTrackingStatus } from '../../../../generated/prisma/enums';

export const getShowDisplayStatus = (show: TrackedShow): ShowTrackingStatus => {
  const episodes = show.seasons
    .filter((season) => season.seasonNumber !== 0)
    .flatMap((season) => season.episodes);

  const totalEpisodes = episodes.length;

  if (!totalEpisodes) {
    return show.tracking?.status ?? ShowTrackingStatus.PLAN_TO_WATCH;
  }

  const watchedEpisodes = episodes.filter((episode) => episode.tracking?.watched).length;

  if (watchedEpisodes === totalEpisodes) {
    return ShowTrackingStatus.COMPLETED;
  }

  if (watchedEpisodes > 0) {
    return ShowTrackingStatus.WATCHING;
  }

  return show.tracking?.status ?? ShowTrackingStatus.PLAN_TO_WATCH;
};
