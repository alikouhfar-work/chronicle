import { getTrackedShow } from '@/features/show';
import { Show } from '@/features/show/types/show';
import { syncShow } from '@/features/library/services/syncShow';

const shouldSyncShow = (show: Show) => {
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

export const getFreshTrackedShow = async (id: string) => {
  const show = await getTrackedShow(id);

  if (!show) {
    return null;
  }

  const shouldSync = shouldSyncShow(show);

  if (!shouldSync) {
    return show;
  }

  await syncShow(id);

  return show;
};
