'use server';

import { prisma } from '@/infra/db/prisma';
import { requireUserId } from '@/infra/tmdb/forUser';
import type { DeleteNoteResult } from '@/modules/notes/types';
import { logError } from '@/infra/logging/logger';

export const deleteNote = async (noteId: string): Promise<DeleteNoteResult> => {
  let userId: string;
  try {
    userId = await requireUserId();
  } catch {
    return { success: false, error: 'You must be signed in to delete notes.' };
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

  try {
    // Soft delete: keeps the row for auditing while every read filters it out.
    await prisma.mediaNote.update({
      where: { id: noteId },
      data: { deletedAt: new Date() },
    });
  } catch (error) {
    logError({ event: 'note.delete', action: 'deleteNote', error });
    return { success: false, error: 'Could not delete your note.' };
  }

  return { success: true };
};
