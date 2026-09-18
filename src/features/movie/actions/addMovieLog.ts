'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';

export type MovieLogState = {
  success: boolean;
  error?: string;
};

export const addMovieLog = async (
  _prevState: MovieLogState,
  formData: FormData,
): Promise<MovieLogState> => {
  const movieId = formData.get('movieId');
  const ratingRaw = formData.get('rating');
  const notesRaw = formData.get('notes');

  if (typeof movieId !== 'string' || movieId.length === 0) {
    return { success: false, error: 'Missing movie id.' };
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
    await prisma.movieTracking.upsert({
      where: { movieId },
      create: {
        movieId,
        rating: rating === 0 ? null : rating,
        notes: notes.length > 0 ? notes : null,
      },
      update: {
        rating: rating === 0 ? null : rating,
        notes: notes.length > 0 ? notes : null,
      },
    });
  } catch (err) {
    console.error('[saveMovieLog]', err);
    return { success: false, error: 'Could not save your review. Please try again.' };
  }

  // Adjust to whichever route(s) render this component.
  revalidatePath('/library/movies/[id]', 'page');
  revalidatePath('/library');

  return { success: true };
};
