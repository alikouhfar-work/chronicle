/** Notification list/poll limits (runtime values, not types). */
export const NOTIFICATION_LIST_LIMIT = 8;
export const MAX_UNREAD_BADGE = 9;

/**
 * Cache tag for the unread badge. Invalidation is deliberately coarse: any
 * notification write clears it for every recipient, which at this scale costs
 * one recount and avoids a tag per user.
 */
export const NOTIFICATIONS_CACHE_TAG = 'notifications';
