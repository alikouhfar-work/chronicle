/**
 * The only place that reads `NEXT_PUBLIC_*` values.
 *
 * No `server-only` here on purpose: these are inlined into the client bundle by
 * Next, and the poster helpers in `infra/tmdb/images` are used by Client
 * Components. Getters (not constants) keep tests that assign `process.env` after
 * import working.
 */

const APP_URL_FALLBACK = 'http://localhost:3000';
const TMDB_IMAGE_CDN_FALLBACK = 'https://image.tmdb.org/t/p';

const normalize = (value: string): string => value.replace(/\/$/, '');

export const publicEnv = {
  /** Canonical origin, with the localhost fallback applied. */
  get appUrl(): string {
    return normalize(process.env.NEXT_PUBLIC_APP_URL ?? APP_URL_FALLBACK);
  },

  /** The configured origin only — callers that prefer the request host need this. */
  get configuredAppUrl(): string | undefined {
    const value = process.env.NEXT_PUBLIC_APP_URL;
    return value ? normalize(value) : undefined;
  },

  /**
   * TMDB image CDN. `TMDB_IMAGE_BASE_URL` is server-only, so it simply resolves
   * to undefined on the client and the public var (or the CDN default) wins.
   */
  get tmdbImageBaseUrl(): string {
    return normalize(
      process.env.NEXT_PUBLIC_TMDB_IMAGE_BASE_URL ??
        process.env.TMDB_IMAGE_BASE_URL ??
        TMDB_IMAGE_CDN_FALLBACK,
    );
  },
};
