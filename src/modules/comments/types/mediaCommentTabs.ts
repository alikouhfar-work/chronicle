import type { ReactNode } from 'react';
import type { CommentAuthor, CommentMediaType } from '@/modules/comments/types';
import type { InitialCommentPage } from '@/modules/comments/types/initialCommentPage';

export type MediaCommentTab = 'personal' | 'reviews';

export type MediaCommentPersonalNotes = {
  rating?: number | null;
  notes?: string | null;
  trackingStatus?: string | null;
  rewatchCount?: number;
};

export type MediaCommentTabsProps = {
  mediaType: CommentMediaType;
  /** TMDB id, not the per-user internal database id. */
  tmdbId: number;
  /**
   * Personal notes payload. For movies/episodes this maps to the tracking
   * rating/notes. For shows this is the show-level tracking summary; the
   * Personal Notes tab renders that summary with an explicit empty state and
   * does not invent a show notes table.
   */
  personalNotes?: MediaCommentPersonalNotes;
  viewer?: CommentAuthor | null;
  /**
   * Optional add/edit affordance rendered inside the Personal Notes tab.
   * Used by the episode page to reuse the existing EpisodeTracking log modal.
   */
  personalNotesEditor?: ReactNode;
  /** Server-loaded first page of public reviews for this media. */
  initialReviews?: InitialCommentPage;
};

export type PersonalNotesPanelProps = {
  mediaType: CommentMediaType;
  personalNotes?: MediaCommentPersonalNotes;
  viewer?: { id: string } | null;
  signInHref?: string;
  /** Optional add/edit affordance supplied by the hosting page. */
  editor?: ReactNode;
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
