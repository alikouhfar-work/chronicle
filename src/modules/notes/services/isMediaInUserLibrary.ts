import 'server-only';

import { prisma } from '@/infra/db/prisma';
import type { NoteMediaType } from '@/modules/notes/types';

/**
 * Notes are private, so writing one requires the media to still be in the
 * viewer's own library. Falls back to "not mine" for anything unknown: never
 * leak whether another user tracks the same title.
 */
export const isMediaInUserLibrary = async (
  userId: string,
  mediaType: NoteMediaType,
  tmdbId: number,
): Promise<boolean> => {
  if (mediaType === 'movie') {
    const movie = await prisma.movie.findFirst({
      where: { tmdbId, userId },
      select: { id: true },
    });
    return Boolean(movie);
  }

  if (mediaType === 'show') {
    const show = await prisma.show.findFirst({
      where: { tmdbId, userId },
      select: { id: true },
    });
    return Boolean(show);
  }

  const episode = await prisma.episode.findFirst({
    where: { tmdbId, season: { show: { userId } } },
    select: { id: true },
  });
  return Boolean(episode);
};
