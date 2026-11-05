'use server';

import { prisma } from '@/infra/db/prisma';
import { requireUserId } from '@/infra/tmdb/forUser';
import { parseDbId } from '@/shared/lib/validate';
import { revalidateMediaDetail } from '@/shared/lib/revalidate';
import type { SetMediaRatingInput, SetMediaRatingResult } from '@/modules/media/types/mediaRating';
import { logError } from '@/infra/logging/logger';

const MAX_RATING = 5;

/**
 * Ratings are written on their own: this action never touches notes, so a user
 * can rate a title without writing anything and keep any number of notes.
 */
export const setMediaRating = async ({
  mediaType,
  id,
  rating,
}: SetMediaRatingInput): Promise<SetMediaRatingResult> => {
  let rowId: string;
  try {
    rowId = parseDbId(id, 'id');
  } catch {
    return { success: false, error: 'Missing media id.' };
  }

  if (rating !== null && (!Number.isInteger(rating) || rating < 1 || rating > MAX_RATING)) {
    return { success: false, error: `Rating must be between 1 and ${MAX_RATING}.` };
  }

  let userId: string;
  try {
    userId = await requireUserId();
  } catch {
    return { success: false, error: 'You must be signed in to rate.' };
  }

  try {
    if (mediaType === 'movie') {
      const movie = await prisma.movie.findUnique({
        where: { id: rowId },
        select: { tmdbId: true, userId: true },
      });

      if (!movie || movie.userId !== userId) {
        return { success: false, error: 'Movie not found in your library.' };
      }

      await prisma.movieTracking.upsert({
        where: { movieId: rowId },
        create: { movieId: rowId, rating },
        update: { rating },
      });

      revalidateMediaDetail('movie', movie.tmdbId);
      return { success: true };
    }

    if (mediaType !== 'episode') {
      return { success: false, error: 'Unknown media type.' };
    }

    const episode = await prisma.episode.findUnique({
      where: { id: rowId },
      select: { tmdbId: true, season: { select: { show: { select: { tmdbId: true, userId: true } } } } },
    });

    if (!episode || episode.season.show.userId !== userId) {
      return { success: false, error: 'Episode not found in your library.' };
    }

    // Rating only: `watched` stays under the watch toggle's control.
    await prisma.episodeTracking.upsert({
      where: { episodeId: rowId },
      create: { episodeId: rowId, rating },
      update: { rating },
    });

    revalidateMediaDetail('tv', episode.season.show.tmdbId);
    return { success: true };
  } catch (error) {
    logError({ event: 'media.rating.set', action: 'setMediaRating', error });
    return { success: false, error: 'Could not save your rating.' };
  }
};
