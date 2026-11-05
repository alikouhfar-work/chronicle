'use server';

import { prisma } from '@/infra/db/prisma';
import { requireUserId } from '@/infra/tmdb/forUser';
import type { MarkReadResult } from '@/modules/notifications/types';
import { logError } from '@/infra/logging/logger';
import { revalidateUnreadCount } from '@/modules/notifications/services/countUnreadNotifications';

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
    revalidateUnreadCount();
    return { success: true };
  } catch (error) {
    logError({ event: 'notification.readAll', action: 'markAllNotificationsRead', error });
    return { success: false, error: 'Could not mark notifications as read.' };
  }
};
