import type { Season } from '@/modules/episode-season';

/**
 * Watched percentage for a show, computed from the same rows it counts.
 *
 * The denominator used to be TMDB's `numberOfEpisodes`, which drifts from the
 * stored episodes (specials excluded, unaired episodes, re-syncs) and could
 * push the bar past 100%. Counting the stored, non-special episodes keeps the
 * numerator and denominator consistent.
 */
export const getShowProgress = (seasons: Season[]) => {
  let watchedEpisodes = 0;
  let totalEpisodes = 0;

  for (const season of seasons) {
    if (season.seasonNumber === 0) continue;

    for (const episode of season.episodes) {
      totalEpisodes += 1;
      if (episode.tracking?.watched) watchedEpisodes += 1;
    }
  }

  if (totalEpisodes === 0) return 0;

  return Math.min(100, Math.floor((watchedEpisodes / totalEpisodes) * 100));
};

