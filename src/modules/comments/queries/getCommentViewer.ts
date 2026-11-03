import 'server-only';

import { auth } from '@/infra/auth/auth';
import { prisma } from '@/infra/db/prisma';
import { ensureUsername } from '@/modules/user/actions/ensureUsername';
import { publicUserSelect } from '@/modules/user/lib/publicUser';
import type { CommentAuthor } from '@/modules/comments/types';

/**
 * Resolves the signed-in viewer with the public author fields the review
 * composer/feed needs. Handles legacy accounts that have no handle yet.
 */
export const getCommentViewer = async (): Promise<CommentAuthor | null> => {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return null;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: publicUserSelect,
  });
  if (!user) return null;

  if (user.username) return user;

  try {
    const username = await ensureUsername(user.id);
    return { ...user, username };
  } catch {
    return user;
  }
};
