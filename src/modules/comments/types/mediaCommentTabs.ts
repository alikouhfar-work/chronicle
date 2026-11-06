import type { CommentAuthor, CommentMediaType } from '@/modules/comments/types';
import type { InitialCommentPage } from '@/modules/comments/types/initialCommentPage';
import type { NoteView } from '@/modules/notes/types';

export type MediaCommentTab = 'personal' | 'reviews';

export type MediaCommentPersonalNotes = {
  /** Tracking rating; independent from the note list. */
  rating?: number | null;
  /** Internal id of the Movie/Episode tracking row. `null` for shows. */
  ratingTargetId?: string | null;
  trackingStatus?: string | null;
  rewatchCount?: number;
};

export type MediaCommentTabsProps = {
  mediaType: CommentMediaType;
  /** TMDB id, not the per-user internal database id. */
  tmdbId: number;
  viewer?: CommentAuthor | null;
  /**
   * Rating context for the Personal tab. Notes themselves are keyed by
   * mediaType + tmdbId, so the tab always lists the viewer's own notes.
   */
  personalNotes?: MediaCommentPersonalNotes;
  /** Server-loaded first page of the viewer's private notes. */
  initialNotes?: NoteView[];
  /** Server-loaded first page of public reviews for this media. */
  initialReviews?: InitialCommentPage;
};

export type PublicReviewsPanelProps = {
  mediaType: CommentMediaType;
  tmdbId: number;
  viewer: CommentAuthor | null;
  /** Only highlight deep links while this panel is actually visible. */
  active?: boolean;
  /** Server-rendered first page; the client keeps pagination after this. */
  initialReviews?: InitialCommentPage;
};
