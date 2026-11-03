export { NotificationBell } from '@/modules/notifications/components/NotificationBell';

export {
  getUnreadCount,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '@/modules/notifications/services/notifications';

export type {
  MarkReadResult,
  NotificationItem,
  NotificationListResult,
  UnreadCountResult,
} from '@/modules/notifications/types';

export const NOTIFICATION_LIST_LIMIT = 8;
export const MAX_UNREAD_BADGE = 9;
