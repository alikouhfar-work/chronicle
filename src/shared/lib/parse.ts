/**
 * One shape for input validation at request boundaries (WP-30).
 *
 * Every parser returns `ParseResult<T>` instead of throwing, so a route maps a bad
 * body to a 400 with the same message shape everywhere. Deliberately dependency-free
 * — the alternative (zod at four boundaries) buys nothing the app needs today, and
 * `rewatch/lib/writeContract` already follows this shape for writes.
 */

export type ParseResult<T> = { ok: true; value: T } | { ok: false; error: string };

export const parsed = <T>(value: T): ParseResult<T> => ({ ok: true, value });

export const invalid = (error: string): ParseResult<never> => ({ ok: false, error });

export const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

export const parseString = (value: unknown, field: string): ParseResult<string> =>
  typeof value === 'string' && value.trim().length > 0
    ? parsed(value)
    : invalid(`${field} must be a non-empty string.`);

export const parseOptionalString = (
  value: unknown,
  field: string,
): ParseResult<string | undefined> => {
  if (value === undefined || value === null) return parsed(undefined);
  return typeof value === 'string' ? parsed(value) : invalid(`${field} must be a string.`);
};

export const parseOneOf = <T extends string>(
  value: unknown,
  allowed: readonly T[],
  field: string,
): ParseResult<T> =>
  typeof value === 'string' && (allowed as readonly string[]).includes(value)
    ? parsed(value as T)
    : invalid(`${field} must be one of: ${allowed.join(', ')}.`);

/** Body parsing for JSON handlers: a malformed body is a validation failure, not a 500. */
export const readJsonBody = async (request: Request): Promise<ParseResult<unknown>> => {
  try {
    return parsed(await request.json());
  } catch {
    return invalid('Expected a JSON body.');
  }
};
