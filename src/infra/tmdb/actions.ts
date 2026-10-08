'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/infra/db/prisma';
import { requireUserId, validateTmdbTokenCandidate } from '@/infra/tmdb/forUser';
import { encryptTmdbToken } from '@/infra/tmdb/tokenVault';

const looksLikeJwt = (value: string): boolean =>
  value.length >= 32 && value.length <= 4096 && value.startsWith('eyJ');

export const saveTmdbToken = async (
  raw: string,
): Promise<{ ok: boolean; error?: string; masked?: string }> => {
  const userId = await requireUserId();
  const token = raw.trim();
  if (!looksLikeJwt(token)) {
    return { ok: false, error: 'That does not look like a TMDB v4 read-access token (starts with eyJ).' };
  }
  const valid = await validateTmdbTokenCandidate(token);
  if (!valid) {
    return { ok: false, error: 'TMDB rejected this token. Check it and try again.' };
  }
  const { iv, ciphertext } = encryptTmdbToken(token);
  await prisma.user.update({
    where: { id: userId },
    data: { tmdbTokenIv: iv, tmdbTokenCiphertext: ciphertext, tmdbTokenUpdatedAt: new Date() },
  });
  revalidatePath('/');
  return { ok: true, masked: `••••${token.slice(-4)}` };
};

export const deleteTmdbToken = async (): Promise<{ ok: boolean }> => {
  const userId = await requireUserId();
  await prisma.user.update({
    where: { id: userId },
    data: { tmdbTokenIv: null, tmdbTokenCiphertext: null, tmdbTokenUpdatedAt: null },
  });
  revalidatePath('/');
  return { ok: true };
};

export const getTmdbTokenStatus = async (): Promise<{
  configured: boolean;
  updatedAt: Date | null;
}> => {
  const userId = await requireUserId();
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { tmdbTokenCiphertext: true, tmdbTokenUpdatedAt: true },
  });
  return {
    configured: Boolean(user?.tmdbTokenCiphertext),
    updatedAt: user?.tmdbTokenUpdatedAt ?? null,
  };
};
