import { compare } from 'bcryptjs';
import { prisma } from '@/infra/db/prisma';
import { guestEmail } from '@/infra/auth/auth';
import { encryptTmdbToken } from '@/infra/tmdb/tokenVault';
import { signMobileJwt } from '@/infra/auth/mobileJwt';

export type ApiSession = { token: string; user: { id: string; email: string; name: string | null } };

const toSession = async (user: {
  id: string;
  email: string;
  name: string | null;
}): Promise<ApiSession> => ({
  token: await signMobileJwt(user.id, user.email),
  user: { id: user.id, email: user.email, name: user.name },
});

export const verifyCredentials = async (
  email: string,
  password: string,
): Promise<ApiSession | null> => {
  const normalized = email.trim().toLowerCase();
  if (!normalized.includes('@') || password.length < 8) return null;
  const user = await prisma.user.findUnique({ where: { email: normalized } });
  if (!user?.passwordHash) return null;
  if (!(await compare(password, user.passwordHash))) return null;
  return toSession(user);
};

const demoToken = (): string | null =>
  process.env.DEMO_TMDB_TOKEN ?? process.env.TMDB_ACCESS_TOKEN ?? null;

export const signInGuest = async (): Promise<ApiSession | null> => {
  if (process.env.GUEST_LOGIN_ENABLED !== 'true') return null;
  let user = await prisma.user.findUnique({ where: { email: guestEmail } });
  if (!user) {
    try {
      user = await prisma.user.create({ data: { email: guestEmail, name: 'Guest' } });
    } catch {
      user = await prisma.user.findUnique({ where: { email: guestEmail } });
    }
  }
  if (!user) return null;
  const token = demoToken();
  if (!user.tmdbTokenCiphertext && token) {
    try {
      const { iv, ciphertext } = encryptTmdbToken(token);
      user = await prisma.user.update({
        where: { id: user.id },
        data: { tmdbTokenIv: iv, tmdbTokenCiphertext: ciphertext, tmdbTokenUpdatedAt: new Date() },
      });
    } catch (error) {
      console.error('[api][guest] token provisioning failed:', error);
    }
  }
  return toSession(user);
};
