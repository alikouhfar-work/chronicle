import 'server-only';

import { revalidateTag, unstable_cache, updateTag } from 'next/cache';
import { prisma } from '@/infra/db/prisma';
import { NOTIFICATIONS_CACHE_TAG } from '@/modules/notifications/constants';

const readUnreadCount = (userId: string): Promise<number> =>
  prisma.notification.count({ where: { recipientId: userId, isRead: false } });

/**
 * The badge is polled every minute by every open tab, and the count only
 * changes when a notification is written or read — both of which call
 * `revalidateUnreadCount`. Sixty seconds is the safety net, not the mechanism.
 */
const cachedUnreadCount = unstable_cache(readUnreadCount, ['notification-unread-count'], {
  tags: [NOTIFICATIONS_CACHE_TAG],
  revalidate: 60,
});

export const countUnreadNotifications = async (userId: string): Promise<number> => {
  try {
    return await cachedUnreadCount(userId);
  } catch {
    // No Next cache store (unit tests, scripts): read through.
    return readUnreadCount(userId);
  }
};

/**
 * Drops the cached count. Next throws when there is no cache store (unit tests,
 * scripts), so the call is guarded: a failed invalidation must never fail the
 * write that triggered it, and the entry expires on its own.
 */
export const revalidateUnreadCount = (): void => {
  try {
    // `updateTag` makes the acting user's next read see their own write;
    // `revalidateTag` expires the entry for the *other* recipients, who only
    // ever learn about a mention through this tag.
    updateTag(NOTIFICATIONS_CACHE_TAG);
  } catch {
    // updateTag throws outside a Server Action (tests, scripts).
  }
  try {
    revalidateTag(NOTIFICATIONS_CACHE_TAG, 'max');
  } catch {
    // No cache store in this context.
  }
};
