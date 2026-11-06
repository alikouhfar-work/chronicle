'use server';

import { hash } from 'bcryptjs';
import { prisma } from '@/infra/db/prisma';
import { isValidPassword } from '@/infra/auth/auth';
import { ensureUsername } from '@/infra/auth/ensureUsername';
import { logError } from '@/infra/logging/logger';

const MAX_EMAIL_LENGTH = 254;

export const register = async (
  email: string,
  password: string,
): Promise<{ ok: boolean; error?: string }> => {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail.includes('@') || normalizedEmail.length > MAX_EMAIL_LENGTH) {
    return { ok: false, error: 'Enter a valid email address.' };
  }
  if (!isValidPassword(password)) {
    return { ok: false, error: 'Password must be at least 8 characters.' };
  }

  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existing?.passwordHash) {
    return { ok: false, error: 'An account with this email already exists. Try signing in.' };
  }

  const passwordHash = await hash(password, 12);

  if (existing) {
    // OAuth-created account: attach a password so email sign-in works too.
    await prisma.user.update({ where: { email: normalizedEmail }, data: { passwordHash } });
  } else {
    await prisma.user.create({ data: { email: normalizedEmail, passwordHash } });
  }

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: { id: true },
  });
  if (user) {
    // Never block signup on handle allocation; the profile page can retry.
    await ensureUsername(user.id).catch((error: unknown) =>
      logError({ event: 'auth.register.username', action: 'register', userId: user.id, error }),
    );
  }

  return { ok: true };
};
