import 'server-only';

import { randomUUID } from 'node:crypto';
import type { Prisma } from '../../../../generated/prisma/client';
import { RewatchMediaType as DbRewatchMediaType } from '../../../../generated/prisma/enums';
import type {
  MovieTrackingStatus,
  ShowTrackingStatus,
} from '../../../../generated/prisma/enums';
import type {
  MediaRef,
  RewatchDbClient,
  CreateRewatchLogData,
} from '@/modules/rewatch/types/rewatchService';
import { prisma } from '@/infra/db/prisma';
import { buildTrackingTimestamps, deriveShowStatus } from '@/modules/media/tracking';
import { computeSeasonRewatchCount } from '@/modules/rewatch/lib/seasonRewatch';
import {
  isWithinUndoWindow,
  parseRemovalPayload,
  REWATCH_UNDO_WINDOW_MS,
  type RemovedLogRow,
  type RemovalPayload,
} from '@/modules/rewatch/lib/removalPayload';
import {
  parseRewatchMediaType,
  toDbRewatchMediaType,
} from '@/modules/rewatch/lib/mediaType';
import type {
  RecordRewatchResult,
  RemoveRewatchResult,
  RestoreRemovalResult,
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

const LOG_ROW_SELECT = {
  id: true,
  userId: true,
  mediaType: true,
  mediaId: true,
  rewatchedAt: true,
  groupId: true,
  clientRequestId: true,
  showId: true,
  seasonId: true,
  episodeId: true,
  movieId: true,
} as const;

type LogRow = Prisma.RewatchLogGetPayload<{ select: typeof LOG_ROW_SELECT }>;

const toIso = (value: Date | null): string | null => (value ? value.toISOString() : null);

/**
 * Records everything an unwatch is about to change — the log rows themselves and
 * every counter/tracking value that moves with them — before it changes it.
 *
 * The removal is the undo unit: replaying it restores those rows and values
 * verbatim, which is why counters cannot drift from a restored history. Kept for
 * `REWATCH_UNDO_WINDOW_MS`; expired rows are dropped opportunistically here and
 * by the maintenance route.
 */
const captureRemoval = async (
  tx: Prisma.TransactionClient,
  scope: { userId: string; mediaType: RewatchMediaType; mediaId: string; showId?: string },
  logs: LogRow[],
): Promise<string> => {
  const showIds = new Set<string>();
  const seasonIds = new Set<string>();
  const episodeIds = new Set<string>();
  const movieIds = new Set<string>();

  const collect = (set: Set<string>, value: string | null): void => {
    if (value) set.add(value);
  };

  for (const log of logs) {
    collect(showIds, log.showId);
    collect(seasonIds, log.seasonId);
    collect(episodeIds, log.episodeId);
    collect(movieIds, log.movieId);
  }

  if (scope.mediaType === 'show') collect(showIds, scope.showId ?? scope.mediaId);
  if (scope.mediaType === 'season') collect(seasonIds, scope.mediaId);
  if (scope.mediaType === 'episode') collect(episodeIds, scope.mediaId);
  if (scope.mediaType === 'movie') collect(movieIds, scope.mediaId);

  const seasons = await tx.season.findMany({
    where: {
      OR: [{ id: { in: [...seasonIds] } }, { showId: { in: [...showIds] } }],
    },
    select: { id: true, showId: true, rewatchCount: true },
  });

  for (const season of seasons) {
    seasonIds.add(season.id);
    showIds.add(season.showId);
  }

  const [episodes, shows, movies] = await Promise.all([
    tx.episode.findMany({
      where: {
        OR: [{ id: { in: [...episodeIds] } }, { seasonId: { in: [...seasonIds] } }],
      },
      select: {
        id: true,
        rewatchCount: true,
        tracking: { select: { watched: true, watchedAt: true } },
      },
    }),
    tx.show.findMany({
      where: { id: { in: [...showIds] } },
      select: {
        id: true,
        rewatchCount: true,
        tracking: { select: { status: true, startedAt: true, completedAt: true } },
      },
    }),
    tx.movie.findMany({
      where: { id: { in: [...movieIds] } },
      select: {
        id: true,
        rewatchCount: true,
        tracking: { select: { status: true, startedAt: true, completedAt: true } },
      },
    }),
  ]);

  const payload: RemovalPayload = {
    version: 1,
    // What stays behind on this title; the undo refuses if this changed.
    remaining: Math.max(0, (await countTitleLogs(tx, scope)) - logs.length),
    logs: logs.map((log) => ({
      id: log.id,
      userId: log.userId,
      mediaType: log.mediaType.toLowerCase() as RemovedLogRow['mediaType'],
      mediaId: log.mediaId,
      rewatchedAt: log.rewatchedAt.toISOString(),
      groupId: log.groupId,
      clientRequestId: log.clientRequestId,
      showId: log.showId,
      seasonId: log.seasonId,
      episodeId: log.episodeId,
      movieId: log.movieId,
    })),
    episodes: episodes.map((episode) => ({
      id: episode.id,
      rewatchCount: episode.rewatchCount,
      trackingExists: episode.tracking !== null,
      watched: episode.tracking?.watched ?? false,
      watchedAt: toIso(episode.tracking?.watchedAt ?? null),
    })),
    seasons: seasons.map((season) => ({ id: season.id, rewatchCount: season.rewatchCount })),
    shows: shows.map((show) => ({
      id: show.id,
      rewatchCount: show.rewatchCount,
      tracking: show.tracking
        ? {
            status: show.tracking.status,
            startedAt: toIso(show.tracking.startedAt),
            completedAt: toIso(show.tracking.completedAt),
          }
        : null,
    })),
    movies: movies.map((movie) => ({
      id: movie.id,
      rewatchCount: movie.rewatchCount,
      tracking: movie.tracking
        ? {
            status: movie.tracking.status,
            startedAt: toIso(movie.tracking.startedAt),
            completedAt: toIso(movie.tracking.completedAt),
          }
        : null,
    })),
  };

  await tx.rewatchLogRemoval.deleteMany({
    where: {
      userId: scope.userId,
      createdAt: { lt: new Date(Date.now() - REWATCH_UNDO_WINDOW_MS) },
    },
  });

  const removal = await tx.rewatchLogRemoval.create({
    data: {
      userId: scope.userId,
      mediaType: toDbRewatchMediaType(scope.mediaType),
      mediaId: scope.mediaId,
      payload,
    },
    select: { id: true },
  });

  return removal.id;
};

/**
 * Rows a watch removal or its undo is measured against: the film for a movie,
 * the show for anything in a season. Counting them before the delete gives the
 * "left behind" number the undo compares with; counting them at undo time is how
 * a new watch on the same title is detected.
 */
const countTitleLogs = async (
  client: Prisma.TransactionClient,
  scope: { userId: string; mediaType: RewatchMediaType; mediaId: string; showId?: string },
): Promise<number> => {
  const titleScope: Prisma.RewatchLogWhereInput =
    scope.mediaType === 'movie' ? { movieId: scope.mediaId } : { showId: scope.showId };

  if (scope.mediaType !== 'movie' && !scope.showId) return 0;

  return client.rewatchLog.count({ where: { userId: scope.userId, ...titleScope } });
};

/**
 * Reads the rows a removal is about to delete so they can be snapshotted and
 * then deleted by id — the same rows, in one place, instead of a second query
 * after the parent is gone.
 */
const readLogsToRemove = async (
  tx: Prisma.TransactionClient,
  where: Prisma.RewatchLogWhereInput,
): Promise<LogRow[]> => tx.rewatchLog.findMany({ where, select: LOG_ROW_SELECT });

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
        showId: true,
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

    // Only a batch parent owns a cascade. A season row inside a show batch is a
    // child: deleting it removes that row, never the whole show rewatch.
    const isBatchParent = log.groupId === log.id;
    const removalScope: Prisma.RewatchLogWhereInput = isBatchParent
      ? { userId: input.userId, groupId: log.groupId }
      : { id: log.id };

    let removedLogs = 0;
    let undoToken = '';

    const rewatchCount = await prisma.$transaction(async (tx) => {
      const rows = await readLogsToRemove(tx, removalScope);
      // Snapshot rows and counters before they move: this removal is the undo
      // unit, so it has to describe the state this transaction destroys.
      undoToken = await captureRemoval(
        tx,
        {
          userId: input.userId,
          mediaType,
          mediaId: log.mediaId,
          showId: log.showId ?? undefined,
        },
        rows,
      );
      await tx.rewatchLog.deleteMany({ where: { id: { in: rows.map((row) => row.id) } } });
      removedLogs = rows.length;

      // Episode counters move for every cascaded child, not the parent alone.
      const cascadedEpisodeIds = rows
        .map((row) => row.episodeId)
        .filter((episodeId): episodeId is string => episodeId !== null && episodeId !== log.mediaId);

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

      if (mediaType === 'season') {
        // Drop exactly this batch: every row that shares the group id. Timestamps
        // are history, not identity — two batches can share one.
        if (cascadedEpisodeIds.length > 0) {
          await tx.episode.updateMany({
            where: { id: { in: cascadedEpisodeIds }, rewatchCount: { gt: 0 } },
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
        if (cascadedEpisodeIds.length > 0) {
          await tx.episode.updateMany({
            where: { id: { in: cascadedEpisodeIds }, rewatchCount: { gt: 0 } },
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
      removedLogs,
      undoToken,
    };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new DatabaseError(`Failed to remove watch log "${logId}"`, { cause: error });
  }
};

/**
 * Move one logged watch to a different date. Counts are unaffected — the season
 * rule looks at how many watches happened, not when — so nothing is recomputed;
 * only the history ordering changes.
 */
export const updateRewatchLog = async (input: {
  userId: string;
  logId: unknown;
  rewatchedAt: unknown;
}): Promise<{
  logId: string;
  rewatchedAt: Date;
  mediaType: RewatchMediaType;
  tmdbId: number | null;
}> => {
  const logId = parseDbId(input.logId, 'logId');
  const rewatchedAt =
    input.rewatchedAt instanceof Date ? input.rewatchedAt : new Date(String(input.rewatchedAt));

  if (Number.isNaN(rewatchedAt.getTime())) {
    throw new ValidationError('rewatched_at must be a valid date');
  }

  try {
    const log = await prisma.rewatchLog.findUnique({
      where: { id: logId },
      select: { id: true, userId: true, mediaType: true, mediaId: true },
    });

    // Scoped by owner: another account's log id must look missing, not forbidden.
    if (!log || log.userId !== input.userId) {
      throw new NotFoundError(`Watch log not found: ${logId}`);
    }

    const mediaType = parseRewatchMediaType(String(log.mediaType).toLowerCase());
    const target = await getOwnedMediaRef(prisma, input.userId, mediaType, log.mediaId);

    const updated = await prisma.rewatchLog.update({
      where: { id: logId },
      data: { rewatchedAt },
      select: { rewatchedAt: true },
    });

    return { logId, rewatchedAt: updated.rewatchedAt, mediaType, tmdbId: target.tmdbId };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new DatabaseError(`Failed to update watch log "${logId}"`, { cause: error });
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

    let removedLogs = 0;
    let undoToken = '';
    await prisma.$transaction(async (tx) => {
      const rows = await readLogsToRemove(tx, {
        userId: input.userId,
        mediaType: DbRewatchMediaType.EPISODE,
        mediaId: episode.id,
      });
      undoToken = await captureRemoval(
        tx,
        {
          userId: input.userId,
          mediaType: 'episode',
          mediaId: episode.id,
          showId: episode.season.showId,
        },
        rows,
      );
      await tx.rewatchLog.deleteMany({ where: { id: { in: rows.map((row) => row.id) } } });
      removedLogs = rows.length;

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
      removedLogs,
      undoToken,
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

    let removedLogs = 0;
    let undoToken = '';
    await prisma.$transaction(async (tx) => {
      const rows = await readLogsToRemove(tx, {
        userId: input.userId,
        mediaType: DbRewatchMediaType.MOVIE,
        mediaId: movie.id,
      });
      undoToken = await captureRemoval(
        tx,
        { userId: input.userId, mediaType: 'movie', mediaId: movie.id },
        rows,
      );
      await tx.rewatchLog.deleteMany({ where: { id: { in: rows.map((row) => row.id) } } });
      removedLogs = rows.length;

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
      removedLogs,
      undoToken,
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

    let removedLogs = 0;
    let undoToken = '';
    await prisma.$transaction(async (tx) => {
      const rows = await readLogsToRemove(tx, {
        userId: input.userId,
        OR: [
          { mediaType: DbRewatchMediaType.SEASON, mediaId: season.id },
          {
            mediaType: DbRewatchMediaType.EPISODE,
            seasonId: season.id,
          },
        ],
      });
      undoToken = await captureRemoval(
        tx,
        {
          userId: input.userId,
          mediaType: 'season',
          mediaId: season.id,
          showId: season.showId,
        },
        rows,
      );
      await tx.rewatchLog.deleteMany({ where: { id: { in: rows.map((row) => row.id) } } });
      removedLogs = rows.length;

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
      removedLogs,
      undoToken,
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

    let removedLogs = 0;
    let undoToken = '';
    await prisma.$transaction(async (tx) => {
      const rows = await readLogsToRemove(tx, {
        userId: input.userId,
        showId: show.id,
        mediaType: {
          in: [DbRewatchMediaType.SHOW, DbRewatchMediaType.SEASON, DbRewatchMediaType.EPISODE],
        },
      });
      undoToken = await captureRemoval(
        tx,
        { userId: input.userId, mediaType: 'show', mediaId: show.id, showId: show.id },
        rows,
      );
      await tx.rewatchLog.deleteMany({ where: { id: { in: rows.map((row) => row.id) } } });
      removedLogs = rows.length;

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
      removedLogs,
      undoToken,
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

/**
 * Restores a watch removal recorded by any of the delete paths, replaying the
 * snapshot it stored: the log rows come back with their original ids and group
 * ids, and every counter/tracking value returns to the number it held before the
 * unwatch. That is why the undo is byte-for-byte instead of a best-effort
 * re-derivation.
 *
 * Refuses when new watches were logged for the same target since the removal —
 * replaying the snapshot would then overwrite work the user did afterwards —
 * and when the window has passed.
 */
export const restoreWatchRemoval = async (input: {
  userId: string;
  removalId: unknown;
}): Promise<RestoreRemovalResult> => {
  const removalId = parseDbId(input.removalId, 'removalId');

  try {
    const removal = await prisma.rewatchLogRemoval.findUnique({
      where: { id: removalId },
      select: {
        id: true,
        userId: true,
        mediaType: true,
        mediaId: true,
        payload: true,
        createdAt: true,
      },
    });

    // Scoped by owner: another account's removal id must look missing.
    if (!removal || removal.userId !== input.userId) {
      throw new NotFoundError(`Watch removal not found: ${removalId}`);
    }

    if (!isWithinUndoWindow(removal.createdAt)) {
      throw new ValidationError(
        'The 10-minute undo window for this watch removal has passed.',
      );
    }

    const payload = parseRemovalPayload(removal.payload);
    const mediaType = parseRewatchMediaType(String(removal.mediaType).toLowerCase());
    const target = await getOwnedMediaRef(prisma, input.userId, mediaType, removal.mediaId);

    const rewatchCount = await prisma.$transaction(async (tx) => {
      // The undo replays counters and tracking values verbatim, so it is only
      // safe while nothing else changed on this title: if the user logged a
      // watch anywhere on the same show (or film) afterwards, the snapshot is
      // stale and restoring it would overwrite that watch.
      const current = await countTitleLogs(tx, {
        userId: input.userId,
        mediaType,
        mediaId: removal.mediaId,
        showId: payload.shows[0]?.id ?? payload.logs[0]?.showId ?? undefined,
      });

      if (current !== payload.remaining) {
        throw new ValidationError(
          'New watches were logged for this title after the unwatch, so it can no longer be undone.',
        );
      }

      await tx.rewatchLog.createMany({
        data: payload.logs.map((log) => ({
          id: log.id,
          userId: log.userId,
          mediaType: toDbRewatchMediaType(log.mediaType as RewatchMediaType),
          mediaId: log.mediaId,
          rewatchedAt: new Date(log.rewatchedAt),
          groupId: log.groupId,
          clientRequestId: log.clientRequestId,
          showId: log.showId,
          seasonId: log.seasonId,
          episodeId: log.episodeId,
          movieId: log.movieId,
        })),
        skipDuplicates: true,
      });

      for (const episode of payload.episodes) {
        await tx.episode.update({
          where: { id: episode.id },
          data: { rewatchCount: episode.rewatchCount },
        });

        if (episode.trackingExists) {
          await tx.episodeTracking.updateMany({
            where: { episodeId: episode.id },
            data: {
              watched: episode.watched,
              watchedAt: episode.watchedAt ? new Date(episode.watchedAt) : null,
            },
          });
        }
      }

      for (const season of payload.seasons) {
        await tx.season.update({
          where: { id: season.id },
          data: { rewatchCount: season.rewatchCount },
        });
      }

      for (const show of payload.shows) {
        await tx.show.update({
          where: { id: show.id },
          data: { rewatchCount: show.rewatchCount },
        });

        if (show.tracking) {
          const { status, startedAt, completedAt } = show.tracking;
          await tx.showTracking.upsert({
            where: { showId: show.id },
            create: {
              showId: show.id,
              status: status as ShowTrackingStatus,
              startedAt: startedAt ? new Date(startedAt) : null,
              completedAt: completedAt ? new Date(completedAt) : null,
            },
            update: {
              status: status as ShowTrackingStatus,
              startedAt: startedAt ? new Date(startedAt) : null,
              completedAt: completedAt ? new Date(completedAt) : null,
            },
          });
        } else {
          // The unwatch created this row; before it there was none.
          await tx.showTracking.deleteMany({ where: { showId: show.id } });
        }
      }

      for (const movie of payload.movies) {
        await tx.movie.update({
          where: { id: movie.id },
          data: { rewatchCount: movie.rewatchCount },
        });

        if (movie.tracking) {
          const { status, startedAt, completedAt } = movie.tracking;
          await tx.movieTracking.updateMany({
            where: { movieId: movie.id },
            data: {
              status: status as MovieTrackingStatus,
              startedAt: startedAt ? new Date(startedAt) : null,
              completedAt: completedAt ? new Date(completedAt) : null,
            },
          });
        }
      }

      // Single use: replaying the same snapshot twice would duplicate rows.
      await tx.rewatchLogRemoval.delete({ where: { id: removal.id } });

      const restored = await getOwnedMediaRef(tx, input.userId, mediaType, removal.mediaId);
      return restored.rewatchCount;
    });

    return { mediaType, mediaId: removal.mediaId, tmdbId: target.tmdbId, rewatchCount };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new DatabaseError(`Failed to restore watch removal "${removalId}"`, { cause: error });
  }
};

/**
 * Drops removal snapshots whose undo window has passed. Called by the
 * maintenance route and opportunistically on every new removal, so the table
 * stays the size of one undo window instead of the app's whole history.
 */
export const purgeExpiredRemovals = async (options: { userId?: string } = {}): Promise<number> => {
  try {
    const { count } = await prisma.rewatchLogRemoval.deleteMany({
      where: {
        createdAt: { lt: new Date(Date.now() - REWATCH_UNDO_WINDOW_MS) },
        ...(options.userId ? { userId: options.userId } : {}),
      },
    });

    return count;
  } catch (error) {
    throw new DatabaseError('Failed to purge expired watch removals', { cause: error });
  }
};
