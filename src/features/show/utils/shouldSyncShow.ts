import { TrackedShow } from '@/features/show';

export const shouldSyncShow = (show: TrackedShow) => {
  const now = new Date();

  const hasNewlyAiredEpisode = show.seasons.some((season) =>
    season.episodes.some((episode) => {
      return episode.airDate && episode.airDate <= now && episode.airDate > show.lastSyncedAt;
    }),
  );

  if (hasNewlyAiredEpisode) {
    return true;
  }

  if (show.inProduction) {
    // Check for changes to upcoming/current production.
    // Could use a less frequent fallback.
  }

  return false;
};
