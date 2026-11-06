import { prisma } from '@/infra/db/prisma';
import { deriveUsernameBase, withNumericSuffix } from '@/shared/lib/username';

const MAX_ATTEMPTS = 25;

const isUniqueViolation = (error: unknown): boolean =>
  typeof error === 'object' && error !== null && (error as { code?: string }).code === 'P2002';

/**
 * Assigns a unique handle to a user who has none, retrying with a numeric
 * suffix when the derived base is taken. Safe to call repeatedly: an existing
 * handle is returned untouched.
 */
export const ensureUsername = async (userId: string): Promise<string> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, username: true },
  });

  if (!user) {
    throw new Error(`Cannot assign a username: user ${userId} does not exist.`);
  }
  if (user.username) return user.username;

  const base = deriveUsernameBase(user.email, user.id);

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    const candidate = withNumericSuffix(base, attempt);
    try {
      const updated = await prisma.user.update({
        where: { id: user.id },
        data: { username: candidate },
        select: { username: true },
      });
      return updated.username ?? candidate;
    } catch (error) {
      if (!isUniqueViolation(error)) throw error;

      // A concurrent call may have just assigned this user's handle.
      const current = await prisma.user.findUnique({
        where: { id: user.id },
        select: { username: true },
      });
      if (current?.username) return current.username;
    }
  }

  throw new Error(`Could not allocate a unique username for user ${user.id}.`);
};
