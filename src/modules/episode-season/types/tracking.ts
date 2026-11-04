export type EpisodeTracking = {
  id: string;
  watched: boolean;
  watchedAt: Date | null;
  /** Rating only — private notes live in `MediaNote`, independent from this. */
  rating: number | null;
};
