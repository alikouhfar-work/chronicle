import 'server-only';

import type { Prisma } from '../../../../generated/prisma/client';
import { RewatchMediaType as DbRewatchMediaType } from '../../../../generated/prisma/enums';
import type {
  MediaRef,
  RewatchDbClient,
  RewatchLogCreateData,
} from '@/modules/rewatch/types/rewatchService';
import { prisma } from '@/infra/db/prisma';
import { buildTrackingTimestamps, deriveShowStatus } from '@/modules/media/tracking';
import {
  parseRewatchMediaType,
  toDbRewatchMediaType,
} from '@/modules/rewatch/lib/mediaType';
import type {
  RecordRewatchResult,
  RemoveRewatchResult,
  RewatchHistoryResult,
  RewatchMediaType,
} from '@/modules/rewatch/types/rewatch';
import {
  AppError,
  DatabaseError,
  NotFoundError,
  ValidationError,
} from '@/shared/lib/errors';
import { parseDbId } from '@/shared/lib/validate';

const EPISODE_CHUNK_SIZE = 500;

const chunk = <T>(items: readonly T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
};

const createRewatchLogs = async (
  tx: Prisma.TransactionClient,
  logs: RewatchLogCreateData[],
): Promise<void> => {
  for (const logsChunk of chunk(logs, EPISODE_CHUNK_SIZE)) {
    if (logsChunk.length > 0) {
      await tx.rewatchLog.createMany({ data: logsChunk });
    }
  }
};

/**
 * Mark episodes watched without resetting the first-watch timestamp on rows
 * that were already watched. New rows are inserted in bounded chunks.
 */
const markEpisodesWatched = async (
  tx: Prisma.TransactionClient,
  episodeIds: string[],
  watchedAt: Date,
): Promise<void> => {
  for (const ids of chunk(episodeIds, EPISODE_CHUNK_SIZE)) {
    if (ids.length === 0) continue;

    await tx.episodeTracking.createMany({
      data: ids.map((episodeId) => ({ episodeId, watched: true, watchedAt })),
      skipDuplicates: true,
    });
    await tx.episodeTracking.updateMany({
      where: { episodeId: { in: ids }, watched: false },
      data: { watched: true, watchedAt },
    });
  }
};

const refreshShowTracking = async (
  tx: Prisma.TransactionClient,
  showId: string,
  userId: string,
  now: Date,
): Promise<void> => {
  const show = await tx.show.findUnique({
    where: { id: showId },
    select: {
      userId: true,
      seasons: {
        where: { seasonNumber: { not: 0 } },
        select: {
          episodes: {
            select: { tracking: { select: { watched: true } } },
          },
        },
      },
    },
  });

  if (!show || show.userId !== userId) {
    throw new NotFoundError(`Show not found: ${showId}`);
  }

  const episodes = show.seasons.flatMap((season) => season.episodes);
  const watchedEpisodes = episodes.filter((episode) => episode.tracking?.watched).length;
  const status = deriveShowStatus(episodes.length, watchedEpisodes);
  const currentTracking = await tx.showTracking.findUnique({
    where: { showId },
    select: { startedAt: true },
  });
  const timestamps = buildTrackingTimestamps(status, currentTracking?.startedAt, now);

  await tx.showTracking.upsert({
    where: { showId },
    create: { showId, status, ...timestamps },
    update: { status, ...timestamps },
  });
};

const getOwnedMediaRef = async (
  client: RewatchDbClient,
  userId: string,
  mediaType: RewatchMediaType,
  mediaId: string,
): Promise<MediaRef> => {
  if (mediaType === 'show') {
    const show = await client.show.findUnique({
      where: { id: mediaId },
      select: { userId: true, tmdbId: true, rewatchCount: true },
    });

    if (!show || show.userId !== userId) {
      throw new NotFoundError(`Show not found: ${mediaId}`);
    }

    return { tmdbId: show.tmdbId, rewatchCount: show.rewatchCount };
  }

  if (mediaType === 'movie') {
    const movie = await client.movie.findUnique({
      where: { id: mediaId },
      select: { userId: true, tmdbId: true, rewatchCount: true },
    });

    if (!movie || movie.userId !== userId) {
      throw new NotFoundError(`Movie not found: ${mediaId}`);
    }

    return { tmdbId: movie.tmdbId, rewatchCount: movie.rewatchCount };
  }

  if (mediaType === 'season') {
    const season = await client.season.findUnique({
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

  const episode = await client.episode.findUnique({
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

const recordEpisodeRewatch = async (
  tx: Prisma.TransactionClient,
  userId: string,
  mediaId: string,
  rewatchedAt: Date,
  dbMediaType: DbRewatchMediaType,
): Promise<RecordRewatchResult> => {
  const episode = await tx.episode.findUnique({
    where: { id: mediaId },
    select: {
      id: true,
      rewatchCount: true,
      season: {
        select: {
          id: true,
          showId: true,
          show: { select: { userId: true, tmdbId: true } },
        },
      },
    },
  });

  if (!episode || episode.season.show.userId !== userId) {
    throw new NotFoundError(`Episode not found: ${mediaId}`);
  }

  const log = await tx.rewatchLog.create({
    data: {
      userId,
      mediaType: dbMediaType,
      mediaId: episode.id,
      rewatchedAt,
      showId: episode.season.showId,
      seasonId: episode.season.id,
      episodeId: episode.id,
    },
    select: { id: true },
  });

  await tx.episode.update({
    where: { id: episode.id },
    data: { rewatchCount: { increment: 1 } },
  });
  await markEpisodesWatched(tx, [episode.id], rewatchedAt);
  await refreshShowTracking(tx, episode.season.showId, userId, rewatchedAt);

  return {
    mediaType: 'episode',
    mediaId: episode.id,
    tmdbId: episode.season.show.tmdbId,
    rewatchCount: episode.rewatchCount + 1,
    logId: log.id,
    rewatchedAt,
  };
};

const recordSeasonRewatch = async (
  tx: Prisma.TransactionClient,
  userId: string,
  mediaId: string,
  rewatchedAt: Date,
  dbMediaType: DbRewatchMediaType,
): Promise<RecordRewatchResult> => {
  const season = await tx.season.findUnique({
    where: { id: mediaId },
    select: {
      id: true,
      showId: true,
      rewatchCount: true,
      show: { select: { userId: true, tmdbId: true } },
      episodes: { select: { id: true, airDate: true } },
    },
  });

  if (!season || season.show.userId !== userId) {
    throw new NotFoundError(`Season not found: ${mediaId}`);
  }

  const log = await tx.rewatchLog.create({
    data: {
      userId,
      mediaType: dbMediaType,
      mediaId: season.id,
      rewatchedAt,
      showId: season.showId,
      seasonId: season.id,
    },
    select: { id: true },
  });

  const episodeLogs: RewatchLogCreateData[] = season.episodes.map((episode) => ({
    userId,
    mediaType: DbRewatchMediaType.EPISODE,
    mediaId: episode.id,
    rewatchedAt,
    showId: season.showId,
    seasonId: season.id,
    episodeId: episode.id,
  }));
  await createRewatchLogs(tx, episodeLogs);

  await tx.season.update({
    where: { id: season.id },
    data: { rewatchCount: { increment: 1 } },
  });
  await tx.episode.updateMany({
    where: { seasonId: season.id },
    data: { rewatchCount: { increment: 1 } },
  });

  // Rewatches belong to episodes that have already aired. Future episodes can
  // still receive the cascade counter/log, but are never marked watched early.
  const now = new Date();
  const airedEpisodeIds = season.episodes
    .filter((episode) => !episode.airDate || episode.airDate <= now)
    .map((episode) => episode.id);
  await markEpisodesWatched(tx, airedEpisodeIds, rewatchedAt);
  await refreshShowTracking(tx, season.showId, userId, rewatchedAt);

  return {
    mediaType: 'season',
    mediaId: season.id,
    tmdbId: season.show.tmdbId,
    rewatchCount: season.rewatchCount + 1,
    logId: log.id,
    rewatchedAt,
  };
};

const recordShowRewatch = async (
  tx: Prisma.TransactionClient,
  userId: string,
  mediaId: string,
  rewatchedAt: Date,
  dbMediaType: DbRewatchMediaType,
): Promise<RecordRewatchResult> => {
  const show = await tx.show.findUnique({
    where: { id: mediaId },
    select: {
      id: true,
      userId: true,
      tmdbId: true,
      rewatchCount: true,
      seasons: {
        select: {
          id: true,
          episodes: { select: { id: true } },
        },
      },
    },
  });

  if (!show || show.userId !== userId) {
    throw new NotFoundError(`Show not found: ${mediaId}`);
  }

  const log = await tx.rewatchLog.create({
    data: {
      userId,
      mediaType: dbMediaType,
      mediaId: show.id,
      rewatchedAt,
      showId: show.id,
    },
    select: { id: true },
  });

  const seasonLogs: RewatchLogCreateData[] = show.seasons.map((season) => ({
    userId,
    mediaType: DbRewatchMediaType.SEASON,
    mediaId: season.id,
    rewatchedAt,
    showId: show.id,
    seasonId: season.id,
  }));
  const episodeLogs: RewatchLogCreateData[] = show.seasons.flatMap((season) =>
    season.episodes.map((episode) => ({
      userId,
      mediaType: DbRewatchMediaType.EPISODE,
      mediaId: episode.id,
      rewatchedAt,
      showId: show.id,
      seasonId: season.id,
      episodeId: episode.id,
    })),
  );
  await createRewatchLogs(tx, [...seasonLogs, ...episodeLogs]);

  const seasonIds = show.seasons.map((season) => season.id);
  const episodeIds = show.seasons.flatMap((season) =>
    season.episodes.map((episode) => episode.id),
  );

  await tx.show.update({
    where: { id: show.id },
    data: { rewatchCount: { increment: 1 } },
  });
  if (seasonIds.length > 0) {
    await tx.season.updateMany({
      where: { id: { in: seasonIds } },
      data: { rewatchCount: { increment: 1 } },
    });
  }
  if (episodeIds.length > 0) {
    await tx.episode.updateMany({
      where: { id: { in: episodeIds } },
      data: { rewatchCount: { increment: 1 } },
    });
  }

  await markEpisodesWatched(tx, episodeIds, rewatchedAt);
  await refreshShowTracking(tx, show.id, userId, rewatchedAt);

  return {
    mediaType: 'show',
    mediaId: show.id,
    tmdbId: show.tmdbId,
    rewatchCount: show.rewatchCount + 1,
    logId: log.id,
    rewatchedAt,
  };
};

const recordMovieRewatch = async (
  tx: Prisma.TransactionClient,
  userId: string,
  mediaId: string,
  rewatchedAt: Date,
  dbMediaType: DbRewatchMediaType,
): Promise<RecordRewatchResult> => {
  const movie = await tx.movie.findUnique({
    where: { id: mediaId },
    select: {
      id: true,
      userId: true,
      tmdbId: true,
      rewatchCount: true,
      tracking: { select: { startedAt: true } },
    },
  });

  if (!movie || movie.userId !== userId) {
    throw new NotFoundError(`Movie not found: ${mediaId}`);
  }

  const log = await tx.rewatchLog.create({
    data: {
      userId,
      mediaType: dbMediaType,
      mediaId: movie.id,
      rewatchedAt,
      movieId: movie.id,
    },
    select: { id: true },
  });

  await tx.movie.update({
    where: { id: movie.id },
    data: { rewatchCount: { increment: 1 } },
  });

  const timestamps = buildTrackingTimestamps(
    'COMPLETED',
    movie.tracking?.startedAt,
    rewatchedAt,
  );
  await tx.movieTracking.upsert({
    where: { movieId: movie.id },
    create: { movieId: movie.id, status: 'COMPLETED', ...timestamps },
    update: { status: 'COMPLETED', ...timestamps },
  });

  return {
    mediaType: 'movie',
    mediaId: movie.id,
    tmdbId: movie.tmdbId,
    rewatchCount: movie.rewatchCount + 1,
    logId: log.id,
    rewatchedAt,
  };
};

export const recordRewatch = async (input: {
  userId: string;
  mediaType: unknown;
  mediaId: unknown;
  rewatchedAt?: unknown;
}): Promise<RecordRewatchResult> => {
  const mediaType = parseRewatchMediaType(input.mediaType);
  const mediaId = parseDbId(input.mediaId, 'mediaId');
  const rewatchedAt =
    input.rewatchedAt instanceof Date
      ? input.rewatchedAt
      : input.rewatchedAt === undefined
        ? new Date()
        : new Date(String(input.rewatchedAt));

  if (Number.isNaN(rewatchedAt.getTime())) {
    throw new ValidationError('rewatched_at must be a valid date');
  }

  const dbMediaType = toDbRewatchMediaType(mediaType);

  try {
    return await prisma.$transaction(
      async (tx) => {
        switch (mediaType) {
          case 'episode':
            return recordEpisodeRewatch(tx, input.userId, mediaId, rewatchedAt, dbMediaType);
          case 'season':
            return recordSeasonRewatch(tx, input.userId, mediaId, rewatchedAt, dbMediaType);
          case 'show':
            return recordShowRewatch(tx, input.userId, mediaId, rewatchedAt, dbMediaType);
          case 'movie':
            return recordMovieRewatch(tx, input.userId, mediaId, rewatchedAt, dbMediaType);
        }
      },
      { timeout: 30_000, maxWait: 10_000 },
    );
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new DatabaseError(
      `Failed to record a watch for ${mediaType} "${mediaId}"`,
      { cause: error },
    );
  }
};

export const removeRewatchLog = async (input: {
  userId: string;
  logId: unknown;
}): Promise<RemoveRewatchResult> => {
  const logId = parseDbId(input.logId, 'logId');

  try {
    const log = await prisma.rewatchLog.findUnique({
      where: { id: logId },
      select: { id: true, userId: true, mediaType: true, mediaId: true },
    });

    if (!log || log.userId !== input.userId) {
      throw new NotFoundError(`Watch log not found: ${logId}`);
    }

    const mediaType = log.mediaType.toLowerCase() as RewatchMediaType;
    const target = await getOwnedMediaRef(
      prisma,
      input.userId,
      mediaType,
      log.mediaId,
    );

    await prisma.$transaction(async (tx) => {
      await tx.rewatchLog.delete({ where: { id: log.id } });

      if (mediaType === 'episode') {
        const episode = await tx.episode.findUnique({
          where: { id: log.mediaId },
          select: {
            rewatchCount: true,
            season: { select: { showId: true } },
          },
        });

        if (episode) {
          const nextCount = Math.max(0, episode.rewatchCount - 1);

          if (nextCount !== episode.rewatchCount) {
            await tx.episode.update({
              where: { id: log.mediaId },
              data: { rewatchCount: nextCount },
            });
          }

          // Removing the last watch also clears the watched state. Keep the
          // tracking row so any rating/notes survive.
          if (nextCount === 0) {
            await tx.episodeTracking.updateMany({
              where: { episodeId: log.mediaId },
              data: { watched: false, watchedAt: null },
            });
            await refreshShowTracking(
              tx,
              episode.season.showId,
              input.userId,
              new Date(),
            );
          }
        }
      } else if (mediaType === 'season') {
        await tx.season.updateMany({
          where: { id: log.mediaId, rewatchCount: { gt: 0 } },
          data: { rewatchCount: { decrement: 1 } },
        });
      } else if (mediaType === 'show') {
        await tx.show.updateMany({
          where: { id: log.mediaId, rewatchCount: { gt: 0 } },
          data: { rewatchCount: { decrement: 1 } },
        });
      } else {
        await tx.movie.updateMany({
          where: { id: log.mediaId, rewatchCount: { gt: 0 } },
          data: { rewatchCount: { decrement: 1 } },
        });
      }
    });

    return {
      mediaType,
      mediaId: log.mediaId,
      tmdbId: target.tmdbId,
      rewatchCount: Math.max(0, target.rewatchCount - 1),
    };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new DatabaseError(`Failed to remove watch log "${logId}"`, { cause: error });
  }
};

/**
 * Clear every watch recorded for a single episode: removes its rewatch logs,
 * resets the rewatch counter, and returns the episode to the unwatched state
 * while preserving any rating/notes stored on the tracking row.
 */
export const clearEpisodeWatchHistory = async (input: {
  userId: string;
  mediaId: unknown;
}): Promise<RemoveRewatchResult> => {
  const mediaId = parseDbId(input.mediaId, 'mediaId');

  try {
    const episode = await prisma.episode.findUnique({
      where: { id: mediaId },
      select: {
        id: true,
        season: {
          select: {
            showId: true,
            show: { select: { userId: true, tmdbId: true } },
          },
        },
      },
    });

    if (!episode || episode.season.show.userId !== input.userId) {
      throw new NotFoundError(`Episode not found: ${mediaId}`);
    }

    await prisma.$transaction(async (tx) => {
      await tx.rewatchLog.deleteMany({
        where: {
          userId: input.userId,
          mediaType: DbRewatchMediaType.EPISODE,
          mediaId: episode.id,
        },
      });

      await tx.episode.update({
        where: { id: episode.id },
        data: { rewatchCount: 0 },
      });

      await tx.episodeTracking.updateMany({
        where: { episodeId: episode.id },
        data: { watched: false, watchedAt: null },
      });

      await refreshShowTracking(tx, episode.season.showId, input.userId, new Date());
    });

    return {
      mediaType: 'episode',
      mediaId: episode.id,
      tmdbId: episode.season.show.tmdbId,
      rewatchCount: 0,
    };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new DatabaseError(`Failed to clear watch history for episode "${mediaId}"`, {
      cause: error,
    });
  }
};

export const getRewatchHistory = async (input: {
  userId: string;
  mediaType: unknown;
  mediaId: unknown;
}): Promise<RewatchHistoryResult> => {
  const mediaType = parseRewatchMediaType(input.mediaType);
  const mediaId = parseDbId(input.mediaId, 'mediaId');

  try {
    const target = await getOwnedMediaRef(prisma, input.userId, mediaType, mediaId);
    const history = await prisma.rewatchLog.findMany({
      where: {
        userId: input.userId,
        mediaType: toDbRewatchMediaType(mediaType),
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
