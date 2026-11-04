'use server';

import { prisma } from '@/infra/db/prisma';
import { requireUserId } from '@/infra/tmdb/forUser';
import type { UnreadCountResult } from '@/modules/notifications/types';

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
    const unreadCount = await prisma.notification.count({
      where: { recipientId: userId, isRead: false },
    });
    return { success: true, unreadCount };
  } catch (error) {
    console.error('getUnreadCount error:', error);
    return { success: false, error: 'Could not load notification count.', unreadCount: 0 };
  }
};
