/** How many times one episode has been watched, counting the first viewing. */
export type EpisodeWatchState = {
  watched: boolean;
  rewatchCount: number;
};

export type SeasonRewatchThresholds = {
  /** Every episode in the season must reach this many watches. */
  baselineWatches: number;
  /** ...and at least this many episodes must go one step further. */
  deepEpisodes: number;
  /** Number of watches that makes an episode "deep". */
  deepWatches: number;
};
