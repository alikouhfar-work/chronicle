export { NotificationBell } from '@/modules/notifications/components/NotificationBell';

export {
  getUnreadCount,
  listNotifications,
} from '@/modules/notifications/services/notifications';

export {
  markAllNotificationsRead,
  markNotificationRead,
} from '@/modules/notifications/actions/notifications';

export type {
  MarkReadResult,
  NotificationItem,
  NotificationListResult,
  UnreadCountResult,
} from '@/modules/notifications/types';

export {
  NOTIFICATION_LIST_LIMIT,
  MAX_UNREAD_BADGE,
} from '@/modules/notifications/constants';
