import 'server-only';

import { prisma } from '@/infra/db/prisma';
import type { CommentMediaType } from '@/modules/comments/types';

/**
 * Title of a media item inside the viewer's own library, used as the
 * notification snapshot. Returns null when the media is gone.
 */
export const getUserMediaName = async (
  userId: string,
  mediaType: CommentMediaType,
  tmdbId: number,
): Promise<string | null> => {
  if (mediaType === 'movie') {
    const movie = await prisma.movie.findFirst({
      where: { tmdbId, userId },
      select: { name: true },
    });
    return movie?.name ?? null;
  }

  if (mediaType === 'show') {
    const show = await prisma.show.findFirst({
      where: { tmdbId, userId },
      select: { name: true },
    });
    return show?.name ?? null;
  }

  const episode = await prisma.episode.findFirst({
    where: { tmdbId, season: { show: { userId } } },
    select: { name: true },
  });
  return episode?.name ?? null;
};
