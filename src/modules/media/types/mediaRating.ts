export type MediaRatingTarget = 'movie' | 'episode';

export type SetMediaRatingInput = {
  /** Which tracking row owns the rating. Shows have no rating of their own. */
  mediaType: MediaRatingTarget;
  /** Internal database id of the Movie or Episode row. */
  id: string;
  /** 1-5, or null to clear the rating. */
  rating: number | null;
};

export type SetMediaRatingResult = {
  success: boolean;
  error?: string;
};
