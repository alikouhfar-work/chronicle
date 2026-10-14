import { compare } from 'bcryptjs';
import { prisma } from '@/infra/db/prisma';
import { guestEmail } from '@/infra/auth/auth';
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
  return toSession(user);
};
