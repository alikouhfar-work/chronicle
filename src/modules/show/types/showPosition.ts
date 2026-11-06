export type SeasonSegment = {
  seasonNumber: number;
  watchedFraction: number;
};

export type ShowPosition = {
  /** e.g. "S2 E4" — null when nothing remains to watch. */
  nextLabel: string | null;
  segments: SeasonSegment[];
};
