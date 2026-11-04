'use server';

import { prisma } from '@/infra/db/prisma';
import { requireUserId } from '@/infra/tmdb/forUser';
import type { MarkReadResult } from '@/modules/notifications/types';

export const markAllNotificationsRead = async (): Promise<MarkReadResult> => {
  let userId: string;
  try {
    userId = await requireUserId();
  } catch {
    return { success: false, error: 'You must be signed in to manage notifications.' };
  }

  try {
    await prisma.notification.updateMany({
      where: { recipientId: userId, isRead: false },
      data: { isRead: true },
    });
    return { success: true };
  } catch (error) {
    console.error('markAllNotificationsRead error:', error);
    return { success: false, error: 'Could not mark notifications as read.' };
  }
};
