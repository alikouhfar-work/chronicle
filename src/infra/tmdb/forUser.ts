import { headers } from 'next/headers';
import { auth } from '@/infra/auth/auth';
import { verifyMobileJwt } from '@/infra/auth/mobileJwt';
import {
  tmdbFetch,
  type TmdbFetchOptions,
} from '@/infra/tmdb/client';

export class MissingTmdbTokenError extends Error {
  constructor() {
    super('TMDB token is not set. Save one first.');
    this.name = 'MissingTmdbTokenError';
  }
}

export const requireUserId = async (): Promise<string> => {
  const session = await auth();
  const userId = session?.user?.id;
  if (userId) return userId;
  return requireBearerUserId();
};

/** Resolve the user from `Authorization: Bearer <mobile JWT>`. Throws when absent/invalid. */
export const requireBearerUserId = async (): Promise<string> => {
  const header = (await headers()).get('authorization');
  const token = header?.startsWith('Bearer ') ? header.slice('Bearer '.length).trim() : '';
  if (!token) throw new Error('Unauthorized');
  try {
    const claims = await verifyMobileJwt(token);
    return claims.sub;
  } catch {
    throw new Error('Unauthorized');
  }
};

/**
 * Single server-token model: no per-user token rows.
 * Returns true when the shared server token is configured.
 */
export const hasTmdbToken = async (_userId?: string): Promise<boolean> => {
  void _userId;
  return Boolean(process.env.TMDB_ACCESS_TOKEN ?? process.env.DEMO_TMDB_TOKEN);
};

/**
 * Single server-token fetch (was per-user token).
 * All catalogue reads share TMDB_ACCESS_TOKEN (see infra/tmdb/client).
 * Kept under the old name so existing query/action imports keep working.
 */
export const tmdbFetchForUser = async <T>(
  path: string,
  options: TmdbFetchOptions = {},
): Promise<T> => {
  return tmdbFetch<T>(path, options);
};
