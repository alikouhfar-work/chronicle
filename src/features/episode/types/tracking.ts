export type EpisodeTracking = {
  id: string;
  watched: boolean;
  watchedAt: Date | null;
  rating: number | null;
  notes: string | null;
};
