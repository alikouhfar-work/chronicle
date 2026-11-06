import { ValidationError } from '@/shared/lib/errors';

/**
 * How long a removed watch can be restored. The UI offers the action for a few
 * seconds (a toast), but the server honours the full window so a slow click, a
 * retried request, or a client-side error boundary never loses the ability.
 */
export const REWATCH_UNDO_WINDOW_MS = 10 * 60 * 1000;

/** A `rewatch_logs` row exactly as it was deleted, dates as ISO strings. */
export type RemovedLogRow = {
  id: string;
  userId: string;
  mediaType: 'episode' | 'season' | 'show' | 'movie';
  mediaId: string;
  rewatchedAt: string;
  groupId: string;
  clientRequestId: string | null;
  showId: string | null;
  seasonId: string | null;
  episodeId: string | null;
  movieId: string | null;
};

export type RemovedEpisodeState = {
  id: string;
  rewatchCount: number;
  /** False when the episode had no tracking row at all (never marked watched). */
  trackingExists: boolean;
  watched: boolean;
  watchedAt: string | null;
};

export type RemovedSeasonState = {
  id: string;
  rewatchCount: number;
};

export type RemovedTrackingState = {
  status: string;
  startedAt: string | null;
  completedAt: string | null;
};

export type RemovedShowState = {
  id: string;
  rewatchCount: number;
  tracking: RemovedTrackingState | null;
};

export type RemovedMovieState = {
  id: string;
  rewatchCount: number;
  tracking: RemovedTrackingState | null;
};

/**
 * Everything an unwatch changes, captured before it changes it. Replaying this
 * payload is what makes the undo byte-for-byte: counters and tracking rows are
 * restored to the recorded values rather than re-derived.
 */
export type RemovalPayload = {
  version: 1;
  /**
   * Live log rows left on the title (the show, or the movie) after this removal.
   * Undo compares the current count against it: any difference means the user
   * logged something on that title afterwards, and replaying this snapshot
   * would overwrite it.
   */
  remaining: number;
  logs: RemovedLogRow[];
  episodes: RemovedEpisodeState[];
  seasons: RemovedSeasonState[];
  shows: RemovedShowState[];
  movies: RemovedMovieState[];
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isString = (value: unknown): value is string => typeof value === 'string';
const isNullableString = (value: unknown): value is string | null =>
  value === null || typeof value === 'string';
const isNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);
const isBoolean = (value: unknown): value is boolean => typeof value === 'boolean';
const isArrayOf = <T>(value: unknown, guard: (entry: unknown) => entry is T): value is T[] =>
  Array.isArray(value) && value.every(guard);

const isRemovedLog = (value: unknown): value is RemovedLogRow =>
  isRecord(value) &&
  isString(value.id) &&
  isString(value.userId) &&
  isString(value.mediaType) &&
  isString(value.mediaId) &&
  isString(value.rewatchedAt) &&
  isString(value.groupId) &&
  isNullableString(value.clientRequestId) &&
  isNullableString(value.showId) &&
  isNullableString(value.seasonId) &&
  isNullableString(value.episodeId) &&
  isNullableString(value.movieId);

const isRemovedEpisode = (value: unknown): value is RemovedEpisodeState =>
  isRecord(value) &&
  isString(value.id) &&
  isNumber(value.rewatchCount) &&
  isBoolean(value.trackingExists) &&
  isBoolean(value.watched) &&
  isNullableString(value.watchedAt);

const isRemovedSeason = (value: unknown): value is RemovedSeasonState =>
  isRecord(value) && isString(value.id) && isNumber(value.rewatchCount);

const isTracking = (value: unknown): value is RemovedTrackingState =>
  isRecord(value) &&
  isString(value.status) &&
  isNullableString(value.startedAt) &&
  isNullableString(value.completedAt);

const isRemovedShow = (value: unknown): value is RemovedShowState =>
  isRecord(value) &&
  isString(value.id) &&
  isNumber(value.rewatchCount) &&
  (value.tracking === null || isTracking(value.tracking));

const isRemovedMovie = (value: unknown): value is RemovedMovieState =>
  isRecord(value) &&
  isString(value.id) &&
  isNumber(value.rewatchCount) &&
  (value.tracking === null || isTracking(value.tracking));

/**
 * A stored payload is written by this module, never by a client, but it crosses
 * a JSON column so it comes back as `unknown`. Validate shape before replaying
 * it into writes — a truncated payload must fail loudly, not silently restore
 * half a history.
 */
export const parseRemovalPayload = (value: unknown): RemovalPayload => {
  if (
    !isRecord(value) ||
    value.version !== 1 ||
    !isNumber(value.remaining) ||
    !isArrayOf(value.logs, isRemovedLog) ||
    !isArrayOf(value.episodes, isRemovedEpisode) ||
    !isArrayOf(value.seasons, isRemovedSeason) ||
    !isArrayOf(value.shows, isRemovedShow) ||
    !isArrayOf(value.movies, isRemovedMovie)
  ) {
    throw new ValidationError('This watch removal cannot be restored: its snapshot is malformed.');
  }

  return {
    version: 1,
    remaining: value.remaining,
    logs: value.logs,
    episodes: value.episodes,
    seasons: value.seasons,
    shows: value.shows,
    movies: value.movies,
  };
};

export const isWithinUndoWindow = (createdAt: Date, now: number = Date.now()): boolean =>
  now - createdAt.getTime() <= REWATCH_UNDO_WINDOW_MS;
