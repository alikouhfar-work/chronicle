import 'server-only';

import { prisma } from '@/infra/db/prisma';

export type MentionUser = {
  id: string;
  username: string;
};

/**
 * Resolve every @handle in one lookup. Never trust client-supplied ids: the
 * mention set is always derived from the stored content.
 */
export const resolveMentionUsers = async (handles: string[]): Promise<MentionUser[]> => {
  if (handles.length === 0) return [];

  const users = await prisma.user.findMany({
    where: { username: { in: handles, mode: 'insensitive' } },
    select: { id: true, username: true },
  });

  return [...new Map(users.map((user) => [user.id, user])).values()].map((user) => ({
    id: user.id,
    username: user.username ?? '',
  }));
};
