'use server';

import { prisma } from '@/infra/db/prisma';
import { requireUserId } from '@/infra/tmdb/forUser';
import { PRISMA_MEDIA_TYPE, isCommentMediaType, isTmdbId } from '@/modules/comments/lib/validation';
import { toNoteView } from '@/modules/notes/lib/toNoteView';
import { NOTE_PAGE_SIZE } from '@/modules/notes/constants';
import type { ListNotesResult, NoteMediaType } from '@/modules/notes/types';
import { logError } from '@/infra/logging/logger';

/**
 * Private notes for one media item. Scoped by the session user: a note is
 * never visible to anyone else, so there is no cross-account read path.
 */
export const listNotes = async (
  mediaType: NoteMediaType,
  tmdbId: number,
): Promise<ListNotesResult> => {
  if (!isCommentMediaType(mediaType) || !isTmdbId(tmdbId)) {
    return { success: false, error: 'Invalid media reference.', notes: [] };
  }

  let userId: string;
  try {
    userId = await requireUserId();
  } catch {
    return { success: true, notes: [] };
  }

  try {
    const notes = await prisma.mediaNote.findMany({
      where: {
        userId,
        mediaType: PRISMA_MEDIA_TYPE[mediaType],
        tmdbId,
        deletedAt: null,
      },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: NOTE_PAGE_SIZE,
    });

    return { success: true, notes: notes.map(toNoteView) };
  } catch (error) {
    logError({ event: 'note.list', action: 'listNotes', error });
    return { success: false, error: 'Could not load your notes.', notes: [] };
  }
};
