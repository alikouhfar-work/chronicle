export type LibraryDetailsSeasonActionsProps = {
  showId: string;
  seasonId: string;
  seasonName: string;
  seasonWatched: boolean;
  seasonRewatchCount: number;
  /** Episodes still under the baseline; explains a watched-but-zero season. */
  episodesBelowBaseline?: number;
};
