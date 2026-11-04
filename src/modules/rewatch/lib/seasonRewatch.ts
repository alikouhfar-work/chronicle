import type { EpisodeWatchState, SeasonRewatchThresholds } from '@/modules/rewatch/types/seasonRewatch';

/**
 * Season rewatch rule (Task 13).
 *
 * A season only counts as rewatched when the whole season has been through the
 * baseline number of viewings AND at least two episodes were taken one viewing
 * further. Concretely, with the shipped thresholds:
 *
 *   - every episode has been watched >= 4 times, and
 *   - at least 2 episodes have been watched >= 5 times.
 *
 * When the condition holds, the season's rewatch count is the number of full
 * passes above the baseline: 4 watches everywhere -> 1, 5 everywhere -> 2, …
 * Episodes that ran ahead of the pack do not inflate the count; the slowest
 * episode decides how many complete rewatches the season has.
 */
export const SEASON_REWATCH_THRESHOLDS: SeasonRewatchThresholds = {
  baselineWatches: 4,
  deepEpisodes: 2,
  deepWatches: 5,
};

/** Total watches for one episode: the first viewing plus its rewatches. */
export const episodeWatchCount = ({ watched, rewatchCount }: EpisodeWatchState): number =>
  Math.max(0, rewatchCount) + (watched ? 1 : 0);

export const qualifiesForSeasonRewatch = (
  episodes: readonly EpisodeWatchState[],
  thresholds: SeasonRewatchThresholds = SEASON_REWATCH_THRESHOLDS,
): boolean => {
  if (episodes.length === 0) return false;

  const counts = episodes.map(episodeWatchCount);

  return (
    counts.every((count) => count >= thresholds.baselineWatches) &&
    counts.filter((count) => count >= thresholds.deepWatches).length >= thresholds.deepEpisodes
  );
};

/**
 * Season rewatch count derived from its episodes. Returns 0 unless the whole
 * season qualifies, so a partial binge never shows a season-level rewatch.
 */
export const computeSeasonRewatchCount = (
  episodes: readonly EpisodeWatchState[],
  thresholds: SeasonRewatchThresholds = SEASON_REWATCH_THRESHOLDS,
): number => {
  if (!qualifiesForSeasonRewatch(episodes, thresholds)) return 0;

  const lowest = Math.min(...episodes.map(episodeWatchCount));
  return Math.max(1, lowest - (thresholds.baselineWatches - 1));
};
