'use server';

import { prisma } from '@/infra/db/prisma';
import { requireUserId } from '@/infra/tmdb/forUser';
import type { MarkReadResult } from '@/modules/notifications/types';

export const markNotificationRead = async (notificationId: string): Promise<MarkReadResult> => {
  let userId: string;
  try {
    userId = await requireUserId();
  } catch {
    return { success: false, error: 'You must be signed in to manage notifications.' };
  }

  if (typeof notificationId !== 'string' || !notificationId.trim()) {
    return { success: false, error: 'Missing notification id.' };
  }

  try {
    // Scoped by recipient: one user can never mark another user's rows.
    const updated = await prisma.notification.updateMany({
      where: { id: notificationId.trim(), recipientId: userId, isRead: false },
      data: { isRead: true },
    });
    if (updated.count === 0) {
      return { success: false, error: 'Notification not found.' };
    }
    return { success: true };
  } catch (error) {
    console.error('markNotificationRead error:', error);
    return { success: false, error: 'Could not mark notification as read.' };
  }
};
