'use server';

import { prisma } from '@/infra/db/prisma';
import { requireUserId } from '@/infra/tmdb/forUser';
import { toNoteView } from '@/modules/notes/lib/toNoteView';
import { NOTE_MAX_LENGTH, NOTE_MIN_LENGTH } from '@/modules/notes/constants';
import type { UpdateNoteInput, UpdateNoteResult } from '@/modules/notes/types';
import { logError } from '@/infra/logging/logger';

export const updateNote = async (
  noteId: string,
  input: UpdateNoteInput,
): Promise<UpdateNoteResult> => {
  let userId: string;
  try {
    userId = await requireUserId();
  } catch {
    return { success: false, error: 'You must be signed in to edit notes.' };
  }

  const note = await prisma.mediaNote.findUnique({
    where: { id: noteId },
    select: { userId: true, deletedAt: true },
  });

  if (!note || note.deletedAt) {
    return { success: false, error: 'Note not found.' };
  }

  if (note.userId !== userId) {
    return { success: false, error: 'This note belongs to someone else.' };
  }

  const content = (input?.content ?? '').trim();
  if (content.length < NOTE_MIN_LENGTH || content.length > NOTE_MAX_LENGTH) {
    return {
      success: false,
      error: `A note must be between ${NOTE_MIN_LENGTH} and ${NOTE_MAX_LENGTH} characters.`,
    };
  }

  try {
    const updated = await prisma.mediaNote.update({
      where: { id: noteId },
      data: { content },
    });

    return { success: true, note: toNoteView(updated) };
  } catch (error) {
    logError({ event: 'note.update', action: 'updateNote', error });
    return { success: false, error: 'Could not update your note.' };
  }
};
