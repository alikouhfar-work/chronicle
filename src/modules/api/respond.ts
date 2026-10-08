import { NextResponse } from 'next/server';
import { AppError, getErrorMessage, toAppError } from '@/shared/lib/errors';
import { MissingTmdbTokenError, hasTmdbToken, requireBearerUserId } from '@/infra/tmdb/forUser';

export type ApiErrorBody = { ok: false; error: string; code: string };

const AUTH_MESSAGES = new Map([
  ['Unauthorized', 'Authentication required. Sign in again.'],
  ['MissingTmdbTokenError', 'TMDB token is not set. Save one first.'],
]);

export const apiError = (error: unknown): NextResponse<ApiErrorBody> => {
  if (error instanceof Error && AUTH_MESSAGES.has(error.message)) {
    return NextResponse.json(
      { ok: false, error: AUTH_MESSAGES.get(error.message)!, code: 'UNAUTHORIZED' },
      { status: 401 },
    );
  }
  if (containsTokenError(error)) {
    return NextResponse.json(
      { ok: false, error: 'TMDB token is not set. Save one first.', code: 'TMDB_TOKEN_MISSING' },
      { status: 428 },
    );
  }
  const appError = error instanceof AppError ? error : toAppError(error);
  return NextResponse.json(
    { ok: false, error: getErrorMessage(appError), code: appError.code },
    { status: appError.status },
  );
};

/** Queries wrap failures (e.g. ExternalServiceError) — dig through causes. */
const containsTokenError = (error: unknown, depth = 0): boolean => {
  if (depth > 4 || !(error instanceof Error)) return false;
  if (error instanceof MissingTmdbTokenError) return true;
  const cause = (error as { cause?: unknown }).cause;
  return containsTokenError(cause, depth + 1);
};

export const apiOk = <T>(data: T, init?: { status?: number }): NextResponse<{ ok: true } & T> =>
  NextResponse.json({ ok: true, ...(data as object) } as { ok: true } & T, {
    status: init?.status ?? 200,
  });

/** Bearer-JWT guard for v1 routes. Returns the user id or throws a 401 ApiError. */
export const requireApiUserId = async (): Promise<string> => requireBearerUserId();

/**
 * TMDB-token guard for pure-discovery routes. Some queries swallow failures
 * into empty lists, so check explicitly and answer 428 when no token is saved.
 * Returns null when the caller may proceed.
 */
export const requireApiTokenOr428 = async (
  userId: string,
): Promise<NextResponse<ApiErrorBody> | null> => {
  if (await hasTmdbToken(userId)) return null;
  return NextResponse.json(
    { ok: false, error: 'TMDB token is not set. Save one first.', code: 'TMDB_TOKEN_MISSING' },
    { status: 428 },
  );
};
