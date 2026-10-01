import { ExternalServiceError } from '@/shared/lib/errors';

class TmdbConfigError extends ExternalServiceError {
  constructor(message: string) {
    super('TMDB', message, { retryable: false, status: 500 });
  }
}

class TmdbApiError extends ExternalServiceError {
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

type TmdbFetchOptions = RequestInit & {
  next?: NextFetchRequestConfig;
  timeoutMs?: number;
};

const resolveBaseUrl = (): string => {
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

export const tmdbFetch = async <T>(path: string, options: TmdbFetchOptions = {}): Promise<T> => {
  const cleanPath = sanitizePath(path);
  const baseUrl = resolveBaseUrl();
  const accessToken = resolveAccessToken();
  const { timeoutMs = 10_000, next, signal, ...init } = options;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${baseUrl}/${cleanPath}`, {
      ...init,
      signal: signal ?? controller.signal,
      next: { revalidate: 86400, ...next },
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      let body = '';
      try {
        body = await response.text();
      } catch {
        body = '';
      }
      throw new TmdbApiError(cleanPath, response.status, body);
    }

    try {
      return (await response.json()) as T;
    } catch {
      throw new TmdbApiError(cleanPath, response.status, 'invalid JSON response');
    }
  } catch (error) {
    if (error instanceof TmdbApiError || error instanceof TmdbConfigError) {
      throw error;
    }
    if (error instanceof Error && error.name === 'AbortError') {
      throw new TmdbNetworkError(cleanPath, { cause: error });
    }
    throw new TmdbNetworkError(cleanPath, { cause: error });
  } finally {
    clearTimeout(timeout);
  }
};
