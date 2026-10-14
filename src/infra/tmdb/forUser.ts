import { auth } from '@/infra/auth/auth';
import {
  tmdbFetch,
  type TmdbFetchOptions,
} from '@/infra/tmdb/client';

export const requireUserId = async (): Promise<string> => {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) throw new Error('Unauthorized');
  return userId;
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
