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

export type SeasonRewatchProgress = {
  count: number;
  /** Watches on the least-watched episode (0 for an empty season). */
  lowestWatches: number;
  /** Episodes still under the baseline, i.e. what gates the season. */
  episodesBelowBaseline: number;
  /** Episodes that reached the deeper threshold. */
  episodesAtDeepThreshold: number;
};

/**
 * The rule plus the reasons it is not met. The UI uses the shortfall to explain
 * why a twice-watched season still shows zero — otherwise the counter looks
 * broken.
 */
export const describeSeasonRewatch = (
  episodes: readonly EpisodeWatchState[],
  thresholds: SeasonRewatchThresholds = SEASON_REWATCH_THRESHOLDS,
): SeasonRewatchProgress => {
  if (episodes.length === 0) {
    return {
      count: 0,
      lowestWatches: 0,
      episodesBelowBaseline: 0,
      episodesAtDeepThreshold: 0,
    };
  }

  const counts = episodes.map(episodeWatchCount);
  const lowestWatches = Math.min(...counts);
  const episodesBelowBaseline = counts.filter(
    (count) => count < thresholds.baselineWatches,
  ).length;
  const episodesAtDeepThreshold = counts.filter(
    (count) => count >= thresholds.deepWatches,
  ).length;

  const qualifies =
    episodesBelowBaseline === 0 && episodesAtDeepThreshold >= thresholds.deepEpisodes;

  return {
    count: qualifies ? Math.max(1, lowestWatches - (thresholds.baselineWatches - 1)) : 0,
    lowestWatches,
    episodesBelowBaseline,
    episodesAtDeepThreshold,
  };
};

/**
 * Season rewatch count derived from its episodes. Returns 0 unless the whole
 * season qualifies, so a partial binge never shows a season-level rewatch.
 */
export const computeSeasonRewatchCount = (
  episodes: readonly EpisodeWatchState[],
  thresholds: SeasonRewatchThresholds = SEASON_REWATCH_THRESHOLDS,
): number => describeSeasonRewatch(episodes, thresholds).count;
