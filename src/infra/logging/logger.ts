export type LogLevel = 'info' | 'warn' | 'error';

export type LogMeta = Record<string, string | number | boolean | null | undefined>;

export type LogFields = {
  /** Stable, greppable name for the operation, e.g. "comment.create". */
  event: string;
  route?: string;
  action?: string;
  userId?: string;
  /** Next.js error digest, surfaced to the user by ErrorState. */
  digest?: string;
  error?: unknown;
  /** Small, non-sensitive context only — see `sanitiseMeta`. */
  meta?: LogMeta;
};

/**
 * Keys that must never reach a log sink. Comment/note bodies, emails, session
 * tokens and credentials are all reachable from the modules that log failures.
 */
const SENSITIVE_KEY = /pass(word)?|secret|token|cookie|authorization|content|body|email/i;

const MAX_MESSAGE_LENGTH = 300;

const truncate = (value: string): string =>
  value.length > MAX_MESSAGE_LENGTH ? `${value.slice(0, MAX_MESSAGE_LENGTH)}…` : value;

const serialiseError = (error: unknown): Record<string, unknown> | undefined => {
  if (error === undefined || error === null) return undefined;

  if (error instanceof Error) {
    const withStatus = error as Error & { status?: unknown; retryable?: unknown; cause?: unknown };

    return {
      name: error.name,
      message: truncate(error.message),
      ...(typeof withStatus.status === 'number' ? { status: withStatus.status } : {}),
      ...(typeof withStatus.retryable === 'boolean' ? { retryable: withStatus.retryable } : {}),
      ...(withStatus.cause instanceof Error
        ? { cause: { name: withStatus.cause.name, message: truncate(withStatus.cause.message) } }
        : {}),
    };
  }

  return { message: truncate(String(error)) };
};

const sanitiseMeta = (meta?: LogMeta): LogMeta | undefined => {
  if (!meta) return undefined;

  const entries = Object.entries(meta)
    .filter(([key, value]) => !SENSITIVE_KEY.test(key) && value !== undefined)
    .map(([key, value]) => [key, typeof value === 'string' ? truncate(value) : value]);

  return entries.length > 0 ? Object.fromEntries(entries) : undefined;
};

/**
 * One JSON line per event, so failures are greppable by `event` and
 * correlatable with the digest a user sees.
 */
export const logEvent = (level: LogLevel, fields: LogFields): void => {
  const record = {
    level,
    time: new Date().toISOString(),
    event: fields.event,
    ...(fields.route ? { route: fields.route } : {}),
    ...(fields.action ? { action: fields.action } : {}),
    ...(fields.userId ? { userId: fields.userId } : {}),
    ...(fields.digest ? { digest: fields.digest } : {}),
    ...(sanitiseMeta(fields.meta) ? { meta: sanitiseMeta(fields.meta) } : {}),
    ...(serialiseError(fields.error) ? { error: serialiseError(fields.error) } : {}),
  };

  const line = JSON.stringify(record);
  if (level === 'error') {
    console.error(line);
    return;
  }
  if (level === 'warn') {
    console.warn(line);
    return;
  }
  console.log(line);
};

export const logError = (fields: LogFields): void => logEvent('error', fields);
export const logWarn = (fields: LogFields): void => logEvent('warn', fields);
export const logInfo = (fields: LogFields): void => logEvent('info', fields);
