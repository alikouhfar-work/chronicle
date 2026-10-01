'use server';

import { prisma } from '@/infra/db/prisma';
import { LibraryDetailsLogState } from '@/modules/library/types/libraryDetailsLog';
import { parseDbId } from '@/shared/lib/validate';
import { revalidateMediaDetail } from '@/shared/lib/revalidate';

const MAX_NOTES_LENGTH = 5000;
const MAX_RATING = 5;

export const addEpisodeLog = async (
  _prevState: LibraryDetailsLogState,
  formData: FormData,
): Promise<LibraryDetailsLogState> => {
  const episodeId = formData.get('episodeId');
  const ratingRaw = formData.get('rating');
  const notesRaw = formData.get('notes');

  let id: string;
  try {
    id = parseDbId(episodeId, 'episodeId');
  } catch {
    return { success: false, error: 'Missing episode id.' };
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
    const episode = await prisma.episode.findUnique({
      where: { id },
      select: { season: { select: { show: { select: { tmdbId: true } } } } },
    });

    if (!episode) {
      return { success: false, error: 'Episode not found in your library.' };
    }

    await prisma.episodeTracking.upsert({
      where: { episodeId: id },
      create: {
        episodeId: id,
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

    revalidateMediaDetail('tv', episode.season.show.tmdbId);
  } catch {
    return { success: false, error: 'Could not save your review. Please try again.' };
  }

  return { success: true };
};
