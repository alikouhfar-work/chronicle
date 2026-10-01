'use server';

import { prisma } from '@/infra/db/prisma';
import { parseDbId } from '@/shared/lib/validate';
import { revalidateMediaDetail } from '@/shared/lib/revalidate';

export type MovieLogState = {
  success: boolean;
  error?: string;
};

const MAX_NOTES_LENGTH = 5000;
const MAX_RATING = 5;

export const addMovieLog = async (
  _prevState: MovieLogState,
  formData: FormData,
): Promise<MovieLogState> => {
  const movieId = formData.get('movieId');
  const ratingRaw = formData.get('rating');
  const notesRaw = formData.get('notes');

  let id: string;
  try {
    id = parseDbId(movieId, 'movieId');
  } catch {
    return { success: false, error: 'Missing movie id.' };
  }

  const rating = Number(ratingRaw);
  if (!Number.isInteger(rating) || rating < 0 || rating > MAX_RATING) {
    return { success: false, error: 'Rating must be between 0 and 5.' };
  }

  const notes = typeof notesRaw === 'string' ? notesRaw.trim() : '';
  if (notes.length > MAX_NOTES_LENGTH) {
    return { success: false, error: 'Review is too long (max 5000 characters).' };
  }

  try {
    const movie = await prisma.movie.findUnique({
      where: { id },
      select: { tmdbId: true },
    });

    if (!movie) {
      return { success: false, error: 'Movie not found in your library.' };
    }

    await prisma.movieTracking.upsert({
      where: { movieId: id },
      create: {
        movieId: id,
        rating: rating === 0 ? null : rating,
        notes: notes.length > 0 ? notes : null,
      },
      update: {
        rating: rating === 0 ? null : rating,
        notes: notes.length > 0 ? notes : null,
      },
    });

    revalidateMediaDetail('movie', movie.tmdbId);
  } catch {
    return { success: false, error: 'Could not save your review. Please try again.' };
  }

  return { success: true };
};
