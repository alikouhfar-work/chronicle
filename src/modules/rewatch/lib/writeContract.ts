import { AppError, getErrorMessage, toAppError } from '@/shared/lib/errors';
import { identityFailure } from '@/infra/http/httpErrorMap';
import { parseDbId } from '@/shared/lib/validate';
import { parseRewatchMediaType } from '@/modules/rewatch/lib/mediaType';
import type { RewatchMediaType } from '@/modules/rewatch/types/rewatch';

/**
 * One contract for the two ways a watch is written: the server action the UI
 * calls and the REST route a mobile client calls. They had drifted — the route
 * accepted `rewatched_at`/`rewatchedAt`/`date` and `Idempotency-Key`, the action
 * had positional arguments, and each mapped failures its own way. Both now build
 * the same command here, so a fixture through either path reaches the service
 * with identical input and fails with an identical shape.
 */

export type RewatchWriteFields = {
  rewatchedAt?: unknown;
  clientRequestId?: unknown;
};

export type RewatchWriteInput = RewatchWriteFields & {
  mediaType: unknown;
  mediaId: unknown;
};

export type RewatchWriteCommand = {
  mediaType: RewatchMediaType;
  mediaId: string;
  rewatchedAt?: unknown;
  clientRequestId?: unknown;
};

/** The body aliases the REST clients are documented to use. */
export const readRewatchWriteFields = (
  payload: unknown,
  idempotencyKey?: string | null,
): RewatchWriteFields => {
  const body =
    typeof payload === 'object' && payload !== null && !Array.isArray(payload)
      ? (payload as Record<string, unknown>)
      : {};

  return {
    rewatchedAt: body.rewatched_at ?? body.rewatchedAt ?? body.date,
    clientRequestId: idempotencyKey ?? body.client_request_id ?? body.clientRequestId,
  };
};

/**
 * Validate a write before it reaches the service. Throws the same
 * `ValidationError` messages from both paths, so a client sees one wording.
 */
export const parseRewatchWriteCommand = (input: RewatchWriteInput): RewatchWriteCommand => ({
  mediaType: parseRewatchMediaType(input.mediaType),
  mediaId: parseDbId(input.mediaId, 'mediaId'),
  rewatchedAt: input.rewatchedAt,
  clientRequestId: input.clientRequestId,
});

/** Same idea for removing one logged watch: an id, or a validation error. */
export const parseRewatchLogId = (logId: unknown): string => parseDbId(logId, 'logId');

export type RewatchFailure = {
  message: string;
  status: number;
  code: string;
};

const WRITE_FALLBACK = 'Couldn’t log the watch. Please try again.';
const REMOVE_FALLBACK = 'Couldn’t remove the watch. Please try again.';

/**
 * The shape a failure takes for a caller. The action uses `message`; the route
 * sends all three. One map means the two adapters cannot disagree about whether
 * a missing log is a 404 or a 500.
 */
export const toRewatchFailure = (
  error: unknown,
  fallback: string = WRITE_FALLBACK,
): RewatchFailure => {
  // An unauthenticated write has no message of its own; keep the same 401 copy
  // the other API routes answer with instead of degrading it to a 500.
  const identity = identityFailure(error);
  if (identity) return identity;

  const appError: AppError = error instanceof AppError ? error : toAppError(error, fallback);

  return {
    message: getErrorMessage(appError, fallback),
    status: appError.status,
    code: appError.code,
  };
};

export const toRewatchRemoveFailure = (error: unknown): RewatchFailure =>
  toRewatchFailure(error, REMOVE_FALLBACK);
