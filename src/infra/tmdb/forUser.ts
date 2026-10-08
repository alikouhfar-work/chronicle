import { auth } from '@/infra/auth/auth';
import { prisma } from '@/infra/db/prisma';
import {
  resolveTmdbBaseUrl,
  tmdbFetchWithToken,
  type TmdbFetchOptions,
} from '@/infra/tmdb/client';
import { decryptTmdbToken } from '@/infra/tmdb/tokenVault';

export class MissingTmdbTokenError extends Error {
  constructor() {
    super('TMDB token is not set. Add it in Settings.');
    this.name = 'MissingTmdbTokenError';
  }
}

export const requireUserId = async (): Promise<string> => {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) throw new Error('Unauthorized');
  return userId;
};

export const getUserTmdbToken = async (userId?: string): Promise<string> => {
  const resolvedUserId = userId ?? (await requireUserId());
  const user = await prisma.user.findUnique({
    where: { id: resolvedUserId },
    select: { tmdbTokenCiphertext: true, tmdbTokenIv: true },
  });
  if (!user?.tmdbTokenCiphertext || !user.tmdbTokenIv) {
    throw new MissingTmdbTokenError();
  }
  return decryptTmdbToken(user.tmdbTokenIv, user.tmdbTokenCiphertext);
};

export const hasTmdbToken = async (userId?: string): Promise<boolean> => {
  try {
    await getUserTmdbToken(userId);
    return true;
  } catch {
    return false;
  }
};

export const tmdbFetchForUser = async <T>(
  path: string,
  options: TmdbFetchOptions = {},
): Promise<T> => {
  const token = await getUserTmdbToken();
  return tmdbFetchWithToken<T>(token, path, options);
};

/** Live-check a pasted token against TMDB without persisting it. */
export const validateTmdbTokenCandidate = async (candidate: string): Promise<boolean> => {
  const baseUrl = resolveTmdbBaseUrl();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);
  try {
    const response = await fetch(`${baseUrl}/configuration`, {
      signal: controller.signal,
      cache: 'no-store',
      headers: { Authorization: `Bearer ${candidate}`, Accept: 'application/json' },
    });
    return response.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timeout);
  }
};
