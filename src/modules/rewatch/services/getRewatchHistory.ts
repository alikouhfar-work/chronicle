'use server';

import { prisma } from '@/infra/db/prisma';
import { parseRewatchMediaType, toDbRewatchMediaType } from '@/modules/rewatch/lib/mediaType';
import type { RewatchHistoryResult, RewatchMediaType } from '@/modules/rewatch/types/rewatch';
import { AppError, DatabaseError, NotFoundError } from '@/shared/lib/errors';
import { parseDbId } from '@/shared/lib/validate';

/**
 * Ownership-scoped media lookup for history reads. Mirrors the guard in
 * `rewatchService` so the read path never leaks cross-user rows.
 */
const getOwnedMediaRef = async (
  userId: string,
  mediaType: RewatchMediaType,
  mediaId: string,
): Promise<{ tmdbId: number; rewatchCount: number }> => {
  if (mediaType === 'show') {
    const show = await prisma.show.findUnique({
      where: { id: mediaId },
      select: { userId: true, tmdbId: true, rewatchCount: true },
    });

    if (!show || show.userId !== userId) {
      throw new NotFoundError(`Show not found: ${mediaId}`);
    }

    return { tmdbId: show.tmdbId, rewatchCount: show.rewatchCount };
  }

  if (mediaType === 'movie') {
    const movie = await prisma.movie.findUnique({
      where: { id: mediaId },
      select: { userId: true, tmdbId: true, rewatchCount: true },
    });

    if (!movie || movie.userId !== userId) {
      throw new NotFoundError(`Movie not found: ${mediaId}`);
    }

    return { tmdbId: movie.tmdbId, rewatchCount: movie.rewatchCount };
  }

  if (mediaType === 'season') {
    const season = await prisma.season.findUnique({
      where: { id: mediaId },
      select: {
        rewatchCount: true,
        show: { select: { userId: true, tmdbId: true } },
      },
    });

    if (!season || season.show.userId !== userId) {
      throw new NotFoundError(`Season not found: ${mediaId}`);
    }

    return { tmdbId: season.show.tmdbId, rewatchCount: season.rewatchCount };
  }

  const episode = await prisma.episode.findUnique({
    where: { id: mediaId },
    select: {
      rewatchCount: true,
      season: { select: { show: { select: { userId: true, tmdbId: true } } } },
    },
  });

  if (!episode || episode.season.show.userId !== userId) {
    throw new NotFoundError(`Episode not found: ${mediaId}`);
  }

  return { tmdbId: episode.season.show.tmdbId, rewatchCount: episode.rewatchCount };
};

export const getRewatchHistory = async (input: {
  userId: string;
  mediaType: unknown;
  mediaId: unknown;
}): Promise<RewatchHistoryResult> => {
  const mediaType = parseRewatchMediaType(input.mediaType);
  const mediaId = parseDbId(input.mediaId, 'mediaId');
  const dbMediaType = toDbRewatchMediaType(mediaType);

  try {
    const target = await getOwnedMediaRef(input.userId, mediaType, mediaId);
    const history = await prisma.rewatchLog.findMany({
      where: {
        userId: input.userId,
        mediaType: dbMediaType,
        mediaId,
      },
      orderBy: [{ rewatchedAt: 'asc' }, { id: 'asc' }],
      select: { id: true, rewatchedAt: true },
    });

    return {
      mediaType,
      mediaId,
      rewatchCount: target.rewatchCount,
      history,
    };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new DatabaseError(`Failed to load watch history for "${mediaId}"`, {
      cause: error,
    });
  }
};
