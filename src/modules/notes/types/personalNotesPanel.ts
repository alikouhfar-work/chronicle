import type { NoteMediaType, NoteView } from '@/modules/notes/types';

export type PersonalNotesPanelProps = {
  mediaType: NoteMediaType;
  /** TMDB id, not the per-user internal database id. */
  tmdbId: number;
  viewer: { id: string } | null;
  signInHref?: string;
  /** 1-5, or null when the title/episode has no rating. */
  rating: number | null;
  /**
   * Internal id of the tracking row that owns the rating (Movie or Episode).
   * `null` for shows, which have no rating of their own.
   */
  ratingTargetId: string | null;
  trackingStatus?: string | null;
  rewatchCount?: number;
  /** Server-rendered first page of the viewer's private notes. */
  initialNotes?: NoteView[];
};

export type NoteComposerProps = {
  initialValue?: string;
  submitting: boolean;
  label: string;
  onSubmit: (content: string) => void;
  onCancel?: () => void;
};
