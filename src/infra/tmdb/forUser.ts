import { headers } from 'next/headers';
import { auth } from '@/infra/auth/auth';
import { verifyMobileJwt } from '@/infra/auth/mobileJwt';
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
  // Web session first (unchanged behavior); mobile Bearer JWT as fallback.
  const session = await auth();
  const sessionUserId = session?.user?.id;
  if (sessionUserId) return sessionUserId;
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
