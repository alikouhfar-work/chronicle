import type { NoteView } from '@/modules/notes/types';

/** Structural row shape so the mapper never depends on the generated client. */
type NoteRow = {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
};

export const toNoteView = (note: NoteRow): NoteView => ({
  id: note.id,
  content: note.content,
  createdAt: note.createdAt,
  updatedAt: note.updatedAt,
});
