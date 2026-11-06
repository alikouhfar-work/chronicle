/**
 * One place where an error's *identity* (not its type) decides the HTTP answer.
 * Both the API responder and the rewatch write contract map failures through
 * this, so an unauthenticated write is a 401 with the same copy everywhere —
 * that pair drifted once already (the action said "Unauthorized", the route said
 * "Authentication required. Sign in again.", and the rewatch route started
 * answering 500).
 */
export type HttpFailure = {
  message: string;
  status: number;
  code: string;
};

const IDENTITY_FAILURES = new Map<string, Omit<HttpFailure, 'status'>>([
  ['Unauthorized', { message: 'Authentication required. Sign in again.', code: 'UNAUTHORIZED' }],
  [
    'MissingTmdbTokenError',
    { message: 'TMDB token is not set. Save one first.', code: 'TMDB_TOKEN_MISSING' },
  ],
]);

/** A 401/428 for errors that the app throws by name, or null for everything else. */
export const identityFailure = (error: unknown): HttpFailure | null => {
  if (!(error instanceof Error)) return null;

  const mapped = IDENTITY_FAILURES.get(error.message);
  if (mapped) return { ...mapped, status: 401 };

  if (error.name === 'MissingTmdbTokenError') {
    return {
      message: 'TMDB token is not set. Save one first.',
      status: 428,
      code: 'TMDB_TOKEN_MISSING',
    };
  }

  return null;
};
