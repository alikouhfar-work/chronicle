'use server';

import { prisma } from '@/infra/db/prisma';
import { requireUserId } from '@/infra/tmdb/forUser';
import { PRISMA_MEDIA_TYPE, isCommentMediaType, isTmdbId } from '@/modules/comments/lib/validation';
import { toNoteView } from '@/modules/notes/lib/toNoteView';
import { isMediaInUserLibrary } from '@/modules/notes/services/isMediaInUserLibrary';
import { NOTE_MAX_LENGTH, NOTE_MIN_LENGTH } from '@/modules/notes/constants';
import type { CreateNoteInput, CreateNoteResult } from '@/modules/notes/types';

export const createNote = async (input: CreateNoteInput): Promise<CreateNoteResult> => {
  let userId: string;
  try {
    userId = await requireUserId();
  } catch {
    return { success: false, error: 'You must be signed in to write notes.' };
  }

  if (!isCommentMediaType(input?.mediaType)) {
    return { success: false, error: 'Unknown media type.' };
  }

  if (!isTmdbId(input.tmdbId)) {
    return { success: false, error: 'Missing media TMDB id.' };
  }

  const content = (input.content ?? '').trim();
  if (content.length < NOTE_MIN_LENGTH || content.length > NOTE_MAX_LENGTH) {
    return {
      success: false,
      error: `A note must be between ${NOTE_MIN_LENGTH} and ${NOTE_MAX_LENGTH} characters.`,
    };
  }

  try {
    if (!(await isMediaInUserLibrary(userId, input.mediaType, input.tmdbId))) {
      return { success: false, error: 'This title is not in your library anymore.' };
    }

    const note = await prisma.mediaNote.create({
      data: {
        userId,
        mediaType: PRISMA_MEDIA_TYPE[input.mediaType],
        tmdbId: input.tmdbId,
        content,
        // Explicit instead of relying on the DB default: local Postgres often
        // runs a non-UTC zone and the column is `timestamp without time zone`.
        createdAt: new Date(),
      },
    });

    return { success: true, note: toNoteView(note) };
  } catch (error) {
    console.error('createNote error:', error);
    return { success: false, error: 'Could not save your note.' };
  }
};
