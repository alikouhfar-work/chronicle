export { NotificationBell } from '@/modules/notifications/components/NotificationBell';

export { getUnreadCount } from '@/modules/notifications/services/getUnreadCount';
export { listNotifications } from '@/modules/notifications/services/listNotifications';

export { markAllNotificationsRead } from '@/modules/notifications/actions/markAllNotificationsRead';
export { markNotificationRead } from '@/modules/notifications/actions/markNotificationRead';

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
