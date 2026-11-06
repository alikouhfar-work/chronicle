'use server';

import { countUnreadNotifications } from '@/modules/notifications/services/countUnreadNotifications';
import { requireUserId } from '@/infra/tmdb/forUser';
import type { UnreadCountResult } from '@/modules/notifications/types';
import { logError } from '@/infra/logging/logger';

export const getUnreadCount = async (): Promise<UnreadCountResult> => {
  let userId: string;
  try {
    userId = await requireUserId();
  } catch {
    return {
      success: false,
      error: 'You must be signed in to view notifications.',
      unreadCount: 0,
    };
  }

  try {
    const unreadCount = await countUnreadNotifications(userId);
    return { success: true, unreadCount };
  } catch (error) {
    logError({ event: 'notification.unreadCount', action: 'getUnreadCount', error });
    return { success: false, error: 'Could not load notification count.', unreadCount: 0 };
  }
};
