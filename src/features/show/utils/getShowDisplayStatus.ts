import { ShowTrackingStatus } from '../../../../generated/prisma/enums';

export function getShowDisplayStatus(show: {
  tracking?: {
    status: ShowTrackingStatus;
  } | null;
  seasons: {
    seasonNumber: number;
    episodes: {
      progress?: {
        watched: boolean;
      } | null;
    }[];
  }[];
}): ShowTrackingStatus {
  const episodes = show.seasons
    .filter((season) => season.seasonNumber !== 0)
    .flatMap((season) => season.episodes);

  const totalEpisodes = episodes.length;

  if (!totalEpisodes) {
    return show.tracking?.status ?? ShowTrackingStatus.PLAN_TO_WATCH;
  }

  const watchedEpisodes = episodes.filter((episode) => episode.progress?.watched).length;

  if (watchedEpisodes === totalEpisodes) {
    return ShowTrackingStatus.COMPLETED;
  }

  if (watchedEpisodes > 0) {
    return ShowTrackingStatus.WATCHING;
  }

  return show.tracking?.status ?? ShowTrackingStatus.PLAN_TO_WATCH;
}
