'use server';

import { prisma } from '@/infra/db/prisma';
import { requireUserId } from '@/infra/tmdb/forUser';
import { attachNotificationHrefs } from '@/modules/notifications/services/attachNotificationHrefs';
import { publicUserSelect } from '@/modules/user/lib/publicUser';
import { NOTIFICATION_LIST_LIMIT } from '@/modules/notifications/constants';
import type { NotificationListResult } from '@/modules/notifications/types';

export const listNotifications = async (): Promise<NotificationListResult> => {
  let userId: string;
  try {
    userId = await requireUserId();
  } catch {
    return {
      success: false,
      error: 'You must be signed in to view notifications.',
      notifications: [],
    };
  }

  try {
    const rows = await prisma.notification.findMany({
      where: { recipientId: userId },
      include: {
        actor: { select: publicUserSelect },
        comment: { select: { deletedAt: true } },
      },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: NOTIFICATION_LIST_LIMIT,
    });

    return { success: true, notifications: await attachNotificationHrefs(userId, rows) };
  } catch (error) {
    console.error('listNotifications error:', error);
    return { success: false, error: 'Could not load notifications.', notifications: [] };
  }
};
