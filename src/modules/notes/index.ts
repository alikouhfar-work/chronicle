export { PersonalNotesPanel } from '@/modules/notes/components/PersonalNotesPanel';
export { NoteComposer } from '@/modules/notes/components/NoteComposer';
export { RatingControl } from '@/modules/notes/components/RatingControl';

export { listNotes } from '@/modules/notes/services/listNotes';

export { createNote, updateNote, deleteNote } from '@/modules/notes/actions';

export type {
  CreateNoteInput,
  CreateNoteResult,
  DeleteNoteResult,
  ListNotesResult,
  NoteMediaType,
  NoteView,
  UpdateNoteInput,
  UpdateNoteResult,
} from '@/modules/notes/types';

export type { PersonalNotesPanelProps } from '@/modules/notes/types/personalNotesPanel';

// Constants (runtime values live outside the types barrel)
export { NOTE_MAX_LENGTH, NOTE_MIN_LENGTH, NOTE_PAGE_SIZE } from '@/modules/notes/constants';
