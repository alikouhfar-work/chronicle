import type { CommentMediaType } from '@/modules/comments/types';

/** Media a private note can be attached to. Mirrors the comment scoping. */
export type NoteMediaType = CommentMediaType;

export type NoteView = {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  /** Client-only flag for optimistic entries. */
  pending?: boolean;
};

export type CreateNoteInput = {
  mediaType: NoteMediaType;
  /** TMDB id, not the per-user internal database id. */
  tmdbId: number;
  content: string;
};

export type UpdateNoteInput = {
  content: string;
};

export type CreateNoteResult = {
  success: boolean;
  error?: string;
  note?: NoteView;
};

export type UpdateNoteResult = {
  success: boolean;
  error?: string;
  note?: NoteView;
};

export type DeleteNoteResult = {
  success: boolean;
  error?: string;
};

export type ListNotesResult = {
  success: boolean;
  error?: string;
  notes: NoteView[];
};
