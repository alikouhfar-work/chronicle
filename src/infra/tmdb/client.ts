import { ExternalServiceError } from '@/shared/lib/errors';

class TmdbConfigError extends ExternalServiceError {
  constructor(message: string) {
    super('TMDB', message, { retryable: false, status: 500 });
  }
}

export class TmdbApiError extends ExternalServiceError {
  readonly httpStatus: number;
  constructor(path: string, httpStatus: number, body?: string) {
    super(
      'TMDB',
      `request failed (${httpStatus}) for "${path}"${body ? `: ${body.slice(0, 300)}` : ''}`,
      { retryable: httpStatus === 429 || httpStatus >= 500, status: 502 },
    );
    this.httpStatus = httpStatus;
  }
}

class TmdbNetworkError extends ExternalServiceError {
  constructor(path: string, opts?: { cause?: unknown }) {
    super('TMDB', `network failure for "${path}"`, { ...opts, retryable: true });
  }
}

export type TmdbFetchOptions = RequestInit & {
  next?: NextFetchRequestConfig;
  timeoutMs?: number;
};

export const resolveTmdbBaseUrl = (): string => {
  const baseUrl = process.env.TMDB_BASE_URL;
  if (!baseUrl) {
    throw new TmdbConfigError('TMDB_BASE_URL is not defined');
  }
  return baseUrl.replace(/\/$/, '');
};

const resolveAccessToken = (): string => {
  const token = process.env.TMDB_ACCESS_TOKEN;
  if (!token) {
    throw new TmdbConfigError('TMDB_ACCESS_TOKEN is not defined');
  }
  return token;
};

const sanitizePath = (path: string): string => {
  const trimmed = path.trim().replace(/^\/+/, '');
  if (!trimmed) {
    throw new TmdbConfigError('TMDB path must be non-empty');
  }
  return trimmed;
};

// --- Shared-quota hardening ------------------------------------------------
// Many guests share one demo token, so: dedupe concurrent identical GETs and
// back off on 429/5xx instead of hammering TMDB.

const MAX_ATTEMPTS = 3;
const MAX_RETRY_DELAY_MS = 10_000;

/** In-flight GETs keyed by method+url+token-suffix. Sharers await one fetch. */
const inflight = new Map<string, Promise<Response>>();

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, Math.min(ms, MAX_RETRY_DELAY_MS)));

const retryDelayMs = (response: Response, attempt: number): number => {
  const retryAfter = response.headers.get('retry-after');
  if (retryAfter) {
    const seconds = Number(retryAfter);
    // Retry-After can be seconds or an HTTP date; only honor plain seconds.
    if (Number.isFinite(seconds) && seconds >= 0) return seconds * 1000;
  }
  return 500 * 2 ** (attempt - 1);
};

const performFetch = async (
  url: string,
  init: RequestInit & { next?: NextFetchRequestConfig },
  timeoutMs: number,
  cleanPath: string,
): Promise<Response> => {
  let lastError: unknown = null;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(url, {
        ...init,
        signal: init.signal ?? controller.signal,
      });
      if (response.ok) return response;
      if (response.status === 429 || response.status >= 500) {
        lastError = await readApiError(cleanPath, response);
        if (attempt < MAX_ATTEMPTS) {
          await sleep(retryDelayMs(response, attempt));
          continue;
        }
        throw lastError;
      }
      throw await readApiError(cleanPath, response);
    } catch (error) {
      if (error instanceof TmdbApiError || error instanceof TmdbConfigError) throw error;
      if (error instanceof Error && error.name === 'AbortError') {
        throw new TmdbNetworkError(cleanPath, { cause: error });
      }
      lastError = new TmdbNetworkError(cleanPath, { cause: error });
      if (attempt < MAX_ATTEMPTS) {
        await sleep(500 * 2 ** (attempt - 1));
        continue;
      }
      throw lastError;
    } finally {
      clearTimeout(timeout);
    }
  }
  throw lastError instanceof Error ? lastError : new TmdbNetworkError(cleanPath);
};

const readApiError = async (cleanPath: string, response: Response): Promise<TmdbApiError> => {
  let body = '';
  try {
    body = await response.text();
  } catch {
    body = '';
  }
  return new TmdbApiError(cleanPath, response.status, body);
};

const fetchShared = (
  url: string,
  accessToken: string,
  options: TmdbFetchOptions,
  cleanPath: string,
): Promise<Response> => {
  const { timeoutMs = 10_000, next, signal, ...init } = options;
  const method = (init.method ?? 'GET').toUpperCase();
  const requestInit: RequestInit & { next?: NextFetchRequestConfig } = {
    ...init,
    next: { revalidate: 86400, ...next },
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
      ...options.headers,
    },
  };
  if (signal) requestInit.signal = signal;

  // Only dedupe plain GETs: custom signals / bodies must stay caller-scoped.
  const shareable = method === 'GET' && !signal && init.body === undefined;
  if (!shareable) return performFetch(url, requestInit, timeoutMs, cleanPath);

  // Key includes a token suffix so different users never share error states,
  // while identical (e.g. guest) tokens collapse onto one request.
  // Each waiter gets its own clone: a Response body can only be read once.
  const key = `${method}:${url}:${accessToken.slice(-8)}`;
  const existing = inflight.get(key);
  if (existing) return existing.then((response) => response.clone());

  const pending = performFetch(url, requestInit, timeoutMs, cleanPath).finally(() => {
    if (inflight.get(key) === pending) inflight.delete(key);
  });
  inflight.set(key, pending);
  return pending.then((response) => response.clone());
};

const parseJson = async <T>(cleanPath: string, response: Response): Promise<T> => {
  try {
    return (await response.json()) as T;
  } catch {
    throw new TmdbApiError(cleanPath, response.status, 'invalid JSON response');
  }
};

export const tmdbFetchWithToken = async <T>(
  accessToken: string,
  path: string,
  options: TmdbFetchOptions = {},
): Promise<T> => {
  const cleanPath = sanitizePath(path);
  const baseUrl = resolveTmdbBaseUrl();
  const response = await fetchShared(
    `${baseUrl}/${cleanPath}`,
    accessToken,
    options,
    cleanPath,
  );
  return parseJson<T>(cleanPath, response);
};

export const tmdbFetch = async <T>(path: string, options: TmdbFetchOptions = {}): Promise<T> => {
  const cleanPath = sanitizePath(path);
  const baseUrl = resolveTmdbBaseUrl();
  const accessToken = resolveAccessToken();
  const response = await fetchShared(
    `${baseUrl}/${cleanPath}`,
    accessToken,
    options,
    cleanPath,
  );
  return parseJson<T>(cleanPath, response);
};
