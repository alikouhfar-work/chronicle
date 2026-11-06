import type { MediaRatingTarget } from '@/modules/media/types/mediaRating';

export type RatingControlProps = {
  mediaType: MediaRatingTarget;
  targetId: string;
  value: number | null;
  label: string;
  /**
   * `panel` is the notes tab (label row plus the "notes stay independent" copy);
   * `compact` is the details header, where the same control has to sit next to
   * the tracking switch without a paragraph of its own.
   */
  variant?: 'panel' | 'compact';
};
