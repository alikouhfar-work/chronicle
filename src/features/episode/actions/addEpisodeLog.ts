'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { LibraryDetailsLogState } from '@/features/library/types/libraryDetailsLog';

export const addEpisodeLog = async (
  _prevState: LibraryDetailsLogState,
  formData: FormData,
): Promise<LibraryDetailsLogState> => {
  const episodeId = formData.get('episodeId');
  const ratingRaw = formData.get('rating');
  const notesRaw = formData.get('notes');

  if (typeof episodeId !== 'string' || episodeId.length === 0) {
    return { success: false, error: 'Missing episode id.' };
  }

  const rating = Number(ratingRaw);
  if (!Number.isInteger(rating) || rating < 0 || rating > 5) {
    return { success: false, error: 'Rating must be between 0 and 5.' };
  }

  const notes = typeof notesRaw === 'string' ? notesRaw.trim() : '';
  if (notes.length > 5000) {
    return { success: false, error: 'Review is too long (max 5000 characters).' };
  }

  try {
    await prisma.episodeTracking.upsert({
      where: { episodeId },
      create: {
        episodeId,
        rating: rating === 0 ? null : rating,
        notes: notes.length > 0 ? notes : null,
        watched: true,
        watchedAt: new Date(),
      },
      update: {
        rating: rating === 0 ? null : rating,
        notes: notes.length > 0 ? notes : null,
        watched: true,
        watchedAt: new Date(),
      },
    });
  } catch (err) {
    console.error('[addEpisodeLog]', err);
    return { success: false, error: 'Could not save your review. Please try again.' };
  }

  revalidatePath('/library/tv/[id]', 'page');
  revalidatePath('/library');

  return { success: true };
};
