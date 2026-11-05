import 'server-only';

import { randomUUID } from 'node:crypto';
import type { Prisma } from '../../../../generated/prisma/client';
import { RewatchMediaType as DbRewatchMediaType } from '../../../../generated/prisma/enums';
import type {
  MediaRef,
  RewatchDbClient,
  CreateRewatchLogData,
} from '@/modules/rewatch/types/rewatchService';
import { prisma } from '@/infra/db/prisma';
import { buildTrackingTimestamps, deriveShowStatus } from '@/modules/media/tracking';
import { computeSeasonRewatchCount } from '@/modules/rewatch/lib/seasonRewatch';
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
  logs: CreateRewatchLogData[],
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

/**
 * Season rewatch counts are derived, never accumulated: every write that touches
 * episode watches funnels through here so the stored value always matches the
 * rule (all episodes >= 4 watches and at least two >= 5).
 */
const syncSeasonRewatchCount = async (
  tx: Prisma.TransactionClient,
  seasonId: string,
): Promise<number> => {
  const season = await tx.season.findUnique({
    where: { id: seasonId },
    select: {
      rewatchCount: true,
      episodes: {
        select: { rewatchCount: true, tracking: { select: { watched: true } } },
      },
    },
  });

  if (!season) return 0;

  const next = computeSeasonRewatchCount(
    season.episodes.map((episode) => ({
      watched: episode.tracking?.watched ?? false,
      rewatchCount: episode.rewatchCount,
    })),
  );

  if (next !== season.rewatchCount) {
    await tx.season.update({ where: { id: seasonId }, data: { rewatchCount: next } });
  }

  return next;
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

/**
 * Recomputes every season of a show from one query instead of one round trip per
 * season, then writes the changes grouped by new value. A show rewatch touches
 * all seasons at once, and a ten-season show should not mean ten extra reads.
 */
const syncShowSeasonRewatchCounts = async (
  tx: Prisma.TransactionClient,
  showId: string,
): Promise<void> => {
  const seasons = await tx.season.findMany({
    where: { showId },
    select: {
      id: true,
      rewatchCount: true,
      episodes: {
        select: { rewatchCount: true, tracking: { select: { watched: true } } },
      },
    },
  });

  const pending = seasons
    .map((season) => ({
      id: season.id,
      next: computeSeasonRewatchCount(
        season.episodes.map((episode) => ({
          watched: episode.tracking?.watched ?? false,
          rewatchCount: episode.rewatchCount,
        })),
      ),
    }))
    .filter((entry) => entry.next !== seasons.find((season) => season.id === entry.id)?.rewatchCount);

  const values = [...new Set(pending.map((entry) => entry.next))];
  for (const value of values) {
    await tx.season.updateMany({
      where: { id: { in: pending.filter((entry) => entry.next === value).map((entry) => entry.id) } },
      data: { rewatchCount: value },
    });
  }
};

const recordEpisodeRewatch = async (
  tx: Prisma.TransactionClient,
  userId: string,
  mediaId: string,
  rewatchedAt: Date,
  dbMediaType: DbRewatchMediaType,
  clientRequestId?: string,
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

  // A standalone watch is its own cascade group of one.
  const groupId = randomUUID();
  const log = await tx.rewatchLog.create({
    data: {
      id: groupId,
      groupId,
      clientRequestId,
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
  await syncSeasonRewatchCount(tx, episode.season.id);
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
  clientRequestId?: string,
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

  // One group for the whole batch: the season log and every episode log share
  // it, so a delete can target exactly this rewatch.
  const groupId = randomUUID();
  const log = await tx.rewatchLog.create({
    data: {
      id: groupId,
      groupId,
      clientRequestId,
      userId,
      mediaType: dbMediaType,
      mediaId: season.id,
      rewatchedAt,
      showId: season.showId,
      seasonId: season.id,
    },
    select: { id: true },
  });

  const episodeLogs: CreateRewatchLogData[] = season.episodes.map((episode) => ({
    userId,
    mediaType: DbRewatchMediaType.EPISODE,
    mediaId: episode.id,
    rewatchedAt,
    groupId,
    showId: season.showId,
    seasonId: season.id,
    episodeId: episode.id,
  }));
  await createRewatchLogs(tx, episodeLogs);

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
  // The season counter is derived from the episode counters, never bumped.
  const seasonRewatchCount = await syncSeasonRewatchCount(tx, season.id);
  await refreshShowTracking(tx, season.showId, userId, rewatchedAt);

  return {
    mediaType: 'season',
    mediaId: season.id,
    tmdbId: season.show.tmdbId,
    rewatchCount: seasonRewatchCount,
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
  clientRequestId?: string,
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

  const groupId = randomUUID();
  const log = await tx.rewatchLog.create({
    data: {
      id: groupId,
      groupId,
      clientRequestId,
      userId,
      mediaType: dbMediaType,
      mediaId: show.id,
      rewatchedAt,
      showId: show.id,
    },
    select: { id: true },
  });

  const seasonLogs: CreateRewatchLogData[] = show.seasons.map((season) => ({
    userId,
    mediaType: DbRewatchMediaType.SEASON,
    mediaId: season.id,
    rewatchedAt,
    groupId,
    showId: show.id,
    seasonId: season.id,
  }));
  const episodeLogs: CreateRewatchLogData[] = show.seasons.flatMap((season) =>
    season.episodes.map((episode) => ({
      userId,
      mediaType: DbRewatchMediaType.EPISODE,
      mediaId: episode.id,
      rewatchedAt,
      groupId,
      showId: show.id,
      seasonId: season.id,
      episodeId: episode.id,
    })),
  );
  await createRewatchLogs(tx, [...seasonLogs, ...episodeLogs]);

  const episodeIds = show.seasons.flatMap((season) =>
    season.episodes.map((episode) => episode.id),
  );

  await tx.show.update({
    where: { id: show.id },
    data: { rewatchCount: { increment: 1 } },
  });
  if (episodeIds.length > 0) {
    await tx.episode.updateMany({
      where: { id: { in: episodeIds } },
      data: { rewatchCount: { increment: 1 } },
    });
  }

  await markEpisodesWatched(tx, episodeIds, rewatchedAt);
  await syncShowSeasonRewatchCounts(tx, show.id);
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
  clientRequestId?: string,
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

  const groupId = randomUUID();
  const log = await tx.rewatchLog.create({
    data: {
      id: groupId,
      groupId,
      clientRequestId,
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

const MAX_REQUEST_ID_LENGTH = 64;

const parseClientRequestId = (value: unknown): string | undefined => {
  if (value === undefined || value === null || value === '') return undefined;
  if (typeof value !== 'string' || value.length > MAX_REQUEST_ID_LENGTH) {
    throw new ValidationError('clientRequestId must be a string of at most 64 characters');
  }
  return value;
};

export const recordRewatch = async (input: {
  userId: string;
  mediaType: unknown;
  mediaId: unknown;
  rewatchedAt?: unknown;
  clientRequestId?: unknown;
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
  const clientRequestId = parseClientRequestId(input.clientRequestId);

  const replay = async (): Promise<RecordRewatchResult | null> => {
    if (!clientRequestId) return null;

    const existing = await prisma.rewatchLog.findUnique({
      where: { userId_clientRequestId: { userId: input.userId, clientRequestId } },
      select: { id: true, mediaId: true, rewatchedAt: true },
    });
    if (!existing) return null;

    if (existing.mediaId !== mediaId) {
      throw new ValidationError('clientRequestId was already used for a different watch');
    }

    const target = await getOwnedMediaRef(prisma, input.userId, mediaType, mediaId);
    return {
      mediaType,
      mediaId,
      tmdbId: target.tmdbId,
      rewatchCount: target.rewatchCount,
      logId: existing.id,
      rewatchedAt: existing.rewatchedAt,
    };
  };

  // A retry (timeout, double submit, second tab) must not log a second watch.
  const replayed = await replay();
  if (replayed) return replayed;

  try {
    return await prisma.$transaction(
      async (tx) => {
        switch (mediaType) {
          case 'episode':
            return recordEpisodeRewatch(
              tx,
              input.userId,
              mediaId,
              rewatchedAt,
              dbMediaType,
              clientRequestId,
            );
          case 'season':
            return recordSeasonRewatch(
              tx,
              input.userId,
              mediaId,
              rewatchedAt,
              dbMediaType,
              clientRequestId,
            );
          case 'show':
            return recordShowRewatch(
              tx,
              input.userId,
              mediaId,
              rewatchedAt,
              dbMediaType,
              clientRequestId,
            );
          case 'movie':
            return recordMovieRewatch(
              tx,
              input.userId,
              mediaId,
              rewatchedAt,
              dbMediaType,
              clientRequestId,
            );
        }
      },
      { timeout: 30_000, maxWait: 10_000 },
    );
  } catch (error) {
    if (error instanceof AppError) throw error;

    // Two concurrent requests with one key: the loser re-reads the winner.
    const concurrent = await replay().catch(() => null);
    if (concurrent) return concurrent;

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
      select: {
        id: true,
        userId: true,
        mediaType: true,
        mediaId: true,
        rewatchedAt: true,
        groupId: true,
      },
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

    const rewatchCount = await prisma.$transaction(async (tx) => {
      await tx.rewatchLog.delete({ where: { id: log.id } });

      if (mediaType === 'episode') {
        const episode = await tx.episode.findUnique({
          where: { id: log.mediaId },
          select: {
            rewatchCount: true,
            seasonId: true,
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
          // tracking row so any rating survives.
          if (nextCount === 0) {
            await tx.episodeTracking.updateMany({
              where: { episodeId: log.mediaId },
              data: { watched: false, watchedAt: null },
            });
          }

          await syncSeasonRewatchCount(tx, episode.seasonId);
          await refreshShowTracking(tx, episode.season.showId, input.userId, new Date());
        }

        const row = await tx.episode.findUnique({
          where: { id: log.mediaId },
          select: { rewatchCount: true },
        });
        return row?.rewatchCount ?? 0;
      }

      // Only a batch parent owns a cascade. A season row inside a show batch is
      // a child: deleting it removes that row, never the whole show rewatch.
      const isBatchParent = log.groupId === log.id;

      if (mediaType === 'season') {
        // Drop exactly this batch: the episode logs that share the group id.
        // Timestamps are history, not identity — two batches can share one.
        const cascaded = isBatchParent
          ? await tx.rewatchLog.findMany({
              where: {
                userId: input.userId,
                groupId: log.groupId,
                mediaType: DbRewatchMediaType.EPISODE,
                id: { not: log.id },
              },
              select: { id: true, episodeId: true },
            })
          : [];
        if (cascaded.length > 0) {
          await tx.rewatchLog.deleteMany({
            where: { id: { in: cascaded.map((entry) => entry.id) } },
          });
          const episodeIds = cascaded
            .map((entry) => entry.episodeId)
            .filter((episodeId): episodeId is string => episodeId !== null);
          await tx.episode.updateMany({
            where: { id: { in: episodeIds }, rewatchCount: { gt: 0 } },
            data: { rewatchCount: { decrement: 1 } },
          });
        }

        const season = await tx.season.findUnique({
          where: { id: log.mediaId },
          select: { showId: true },
        });
        const derived = await syncSeasonRewatchCount(tx, log.mediaId);
        if (season) {
          await refreshShowTracking(tx, season.showId, input.userId, new Date());
        }
        return derived;
      }

      if (mediaType === 'show') {
        // Same idea one level up: season and episode logs of this batch.
        const cascaded = isBatchParent
          ? await tx.rewatchLog.findMany({
              where: {
                userId: input.userId,
                groupId: log.groupId,
                mediaType: { in: [DbRewatchMediaType.SEASON, DbRewatchMediaType.EPISODE] },
                id: { not: log.id },
              },
              select: { id: true, episodeId: true, seasonId: true },
            })
          : [];
        if (cascaded.length > 0) {
          await tx.rewatchLog.deleteMany({
            where: { id: { in: cascaded.map((entry) => entry.id) } },
          });
          const episodeIds = cascaded
            .map((entry) => entry.episodeId)
            .filter((episodeId): episodeId is string => episodeId !== null);
          await tx.episode.updateMany({
            where: { id: { in: episodeIds }, rewatchCount: { gt: 0 } },
            data: { rewatchCount: { decrement: 1 } },
          });
        }

        await syncShowSeasonRewatchCounts(tx, log.mediaId);

        await tx.show.updateMany({
          where: { id: log.mediaId, rewatchCount: { gt: 0 } },
          data: { rewatchCount: { decrement: 1 } },
        });
        await refreshShowTracking(tx, log.mediaId, input.userId, new Date());

        const row = await tx.show.findUnique({
          where: { id: log.mediaId },
          select: { rewatchCount: true },
        });
        return row?.rewatchCount ?? 0;
      }

      await tx.movie.updateMany({
        where: { id: log.mediaId, rewatchCount: { gt: 0 } },
        data: { rewatchCount: { decrement: 1 } },
      });
      const movie = await tx.movie.findUnique({
        where: { id: log.mediaId },
        select: { rewatchCount: true },
      });
      return movie?.rewatchCount ?? 0;
    });

    return {
      mediaType,
      mediaId: log.mediaId,
      tmdbId: target.tmdbId,
      // Authoritative post-delete value, not `previous - 1`: season counts are
      // derived from episodes and can move by more than one.
      rewatchCount,
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
        seasonId: true,
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

      await syncSeasonRewatchCount(tx, episode.seasonId);
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

/**
 * Clear every watch recorded for a movie: drops its logs and resets the
 * counter. A completed movie falls back to "plan to watch" (timestamps
 * cleared) while the tracking row survives, so the rating is preserved.
 */
export const clearMovieWatchHistory = async (input: {
  userId: string;
  mediaId: unknown;
}): Promise<RemoveRewatchResult> => {
  const mediaId = parseDbId(input.mediaId, 'mediaId');

  try {
    const movie = await prisma.movie.findUnique({
      where: { id: mediaId },
      select: { id: true, tmdbId: true, userId: true, tracking: { select: { status: true } } },
    });

    if (!movie || movie.userId !== input.userId) {
      throw new NotFoundError(`Movie not found: ${mediaId}`);
    }

    await prisma.$transaction(async (tx) => {
      await tx.rewatchLog.deleteMany({
        where: {
          userId: input.userId,
          mediaType: DbRewatchMediaType.MOVIE,
          mediaId: movie.id,
        },
      });

      await tx.movie.update({ where: { id: movie.id }, data: { rewatchCount: 0 } });

      if (movie.tracking?.status === 'COMPLETED') {
        await tx.movieTracking.update({
          where: { movieId: movie.id },
          data: {
            status: 'PLAN_TO_WATCH',
            startedAt: null,
            completedAt: null,
          },
        });
      }
    });

    return {
      mediaType: 'movie',
      mediaId: movie.id,
      tmdbId: movie.tmdbId,
      rewatchCount: 0,
    };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new DatabaseError(`Failed to clear watch history for movie "${mediaId}"`, {
      cause: error,
    });
  }
};

/**
 * Clear every watch recorded for a season: removes the season's rewatch logs
 * (and the per-episode logs it cascaded), resets the counters, and clears the
 * watched flags. Tracking rows survive so ratings are never lost. The season
 * counter is derived from its episodes, so it follows the Task 13 rule.
 */
export const clearSeasonWatchHistory = async (input: {
  userId: string;
  mediaId: unknown;
}): Promise<RemoveRewatchResult> => {
  const mediaId = parseDbId(input.mediaId, 'mediaId');

  try {
    const season = await prisma.season.findUnique({
      where: { id: mediaId },
      select: {
        id: true,
        showId: true,
        show: { select: { userId: true, tmdbId: true } },
        episodes: { select: { id: true } },
      },
    });

    if (!season || season.show.userId !== input.userId) {
      throw new NotFoundError(`Season not found: ${mediaId}`);
    }

    const episodeIds = season.episodes.map((episode) => episode.id);

    await prisma.$transaction(async (tx) => {
      await tx.rewatchLog.deleteMany({
        where: {
          userId: input.userId,
          OR: [
            { mediaType: DbRewatchMediaType.SEASON, mediaId: season.id },
            {
              mediaType: DbRewatchMediaType.EPISODE,
              seasonId: season.id,
            },
          ],
        },
      });

      await tx.season.update({ where: { id: season.id }, data: { rewatchCount: 0 } });

      if (episodeIds.length > 0) {
        await tx.episode.updateMany({
          where: { id: { in: episodeIds } },
          data: { rewatchCount: 0 },
        });
        await tx.episodeTracking.updateMany({
          where: { episodeId: { in: episodeIds } },
          data: { watched: false, watchedAt: null },
        });
      }

      await refreshShowTracking(tx, season.showId, input.userId, new Date());
    });

    return {
      mediaType: 'season',
      mediaId: season.id,
      tmdbId: season.show.tmdbId,
      rewatchCount: 0,
    };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new DatabaseError(`Failed to clear watch history for season "${mediaId}"`, {
      cause: error,
    });
  }
};

/**
 * Clear every watch recorded for a show: all show/season/episode logs, all
 * counters, and the watched flags. Tracking rows survive (ratings stay).
 */
export const clearShowWatchHistory = async (input: {
  userId: string;
  mediaId: unknown;
}): Promise<RemoveRewatchResult> => {
  const mediaId = parseDbId(input.mediaId, 'mediaId');

  try {
    const show = await prisma.show.findUnique({
      where: { id: mediaId },
      select: { id: true, tmdbId: true, userId: true },
    });

    if (!show || show.userId !== input.userId) {
      throw new NotFoundError(`Show not found: ${mediaId}`);
    }

    await prisma.$transaction(async (tx) => {
      await tx.rewatchLog.deleteMany({
        where: {
          userId: input.userId,
          showId: show.id,
          mediaType: {
            in: [DbRewatchMediaType.SHOW, DbRewatchMediaType.SEASON, DbRewatchMediaType.EPISODE],
          },
        },
      });

      await tx.show.update({ where: { id: show.id }, data: { rewatchCount: 0 } });
      await tx.season.updateMany({
        where: { showId: show.id },
        data: { rewatchCount: 0 },
      });
      await tx.episode.updateMany({
        where: { season: { showId: show.id } },
        data: { rewatchCount: 0 },
      });
      await tx.episodeTracking.updateMany({
        where: { episode: { season: { showId: show.id } } },
        data: { watched: false, watchedAt: null },
      });
      await tx.showTracking.upsert({
        where: { showId: show.id },
        create: { showId: show.id, status: 'PLAN_TO_WATCH', startedAt: null, completedAt: null },
        update: { status: 'PLAN_TO_WATCH', startedAt: null, completedAt: null },
      });
    });

    return {
      mediaType: 'show',
      mediaId: show.id,
      tmdbId: show.tmdbId,
      rewatchCount: 0,
    };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new DatabaseError(`Failed to clear watch history for show "${mediaId}"`, {
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
