'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { IconBell, IconCheck, IconLoader2 } from '@tabler/icons-react';
import { getUnreadCount } from '@/modules/notifications/services/getUnreadCount';
import { listNotifications } from '@/modules/notifications/services/listNotifications';
import { markAllNotificationsRead } from '@/modules/notifications/actions/markAllNotificationsRead';
import { markNotificationRead } from '@/modules/notifications/actions/markNotificationRead';
import { MAX_UNREAD_BADGE } from '@/modules/notifications/constants';
import type { NotificationItem } from '@/modules/notifications/types';
import { createMonogram } from '@/shared/lib/createMonogram';
import { EmptyState } from '@/shared/ui/EmptyState';

const POLL_INTERVAL_MS = 60_000;

const formatBadge = (unreadCount: number): string =>
  unreadCount > MAX_UNREAD_BADGE ? `${MAX_UNREAD_BADGE}+` : String(unreadCount);

/**
 * Defensive by design: notifications are a denormalized snapshot, and rows
 * written by an out-of-date Prisma client can reach the browser without the
 * snapshot fields. A malformed row must never crash the header.
 */
const actorDisplayName = (item: NotificationItem): string =>
  item.actor?.name?.trim() || item.actor?.username || 'Someone';

const notificationText = (item: NotificationItem): string => {
  const title = item.mediaTitle?.trim() || 'a title you follow';
  return `${actorDisplayName(item)} mentioned you in a comment on ${title}`;
};

const notificationDate = (item: NotificationItem): Date | null => {
  const created = new Date(item.createdAt);
  return Number.isNaN(created.getTime()) ? null : created;
};

const notificationTime = (item: NotificationItem): string =>
  notificationDate(item)?.toLocaleString() ?? '';

const notificationIsoTime = (item: NotificationItem): string =>
  notificationDate(item)?.toISOString() ?? '';

/**
 * Header notification bell. Polls the unread count on mount, on every
 * navigation, and on an interval — no websockets in this phase. Reads are
 * optimistic: the badge drops immediately and the server call reconciles.
 */
export const NotificationBell = () => {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [items, setItems] = useState<NotificationItem[] | null>(null);
  const [loadingItems, setLoadingItems] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const refreshCount = useCallback(async () => {
    try {
      const result = await getUnreadCount();
      if (result.success) setUnreadCount(result.unreadCount);
    } catch {
      // The badge keeps its last known value; a failed poll is silent.
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => void refreshCount(), POLL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [refreshCount]);

  // One fetch on mount and one per navigation. Deliberately an effect keyed on
  // `pathname`: fetching from the render phase re-entered itself while a
  // server-action response streamed a new tree, which queued the next action
  // and looped.
  useEffect(() => {
    // refreshCount awaits the action before touching state, so nothing is set
    // synchronously here.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refreshCount();
  }, [pathname, refreshCount]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const handleToggle = async () => {
    const next = !open;
    setOpen(next);
    if (next) {
      setLoadingItems(true);
      setError(null);
      try {
        const result = await listNotifications();
        if (result.success) {
          setItems(result.notifications);
        } else {
          setError(result.error ?? 'Could not load notifications.');
        }
      } catch {
        setError('Could not load notifications.');
      } finally {
        setLoadingItems(false);
      }
    }
  };

  const handleItemClick = (item: NotificationItem) => {
    // Optimistic read: the badge and row update now; the server reconciles.
    // Failures stay silent — the next poll restores the true count.
    setUnreadCount((previous) => Math.max(0, previous - (item.isRead ? 0 : 1)));
    setItems((previous) =>
      previous?.map((entry) => (entry.id === item.id ? { ...entry, isRead: true } : entry)) ?? previous,
    );
    setOpen(false);
    void markNotificationRead(item.id).catch(() => undefined);
  };

  const handleMarkAll = async () => {
    if (markingAll) return;
    setMarkingAll(true);
    const previousItems = items;
    const previousCount = unreadCount;
    setUnreadCount(0);
    setItems((current) => current?.map((entry) => ({ ...entry, isRead: true })) ?? current);
    try {
      const result = await markAllNotificationsRead();
      if (!result.success) throw new Error(result.error);
      void refreshCount();
    } catch {
      setItems(previousItems);
      setUnreadCount(previousCount);
    } finally {
      setMarkingAll(false);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => void handleToggle()}
        aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : 'Notifications'}
        aria-expanded={open}
        aria-haspopup="dialog"
        title="Notifications"
        className="relative flex size-9 cursor-pointer items-center justify-center rounded-full border border-white/8 text-zinc-400 transition-colors hover:border-violet-400/40 hover:text-white"
      >
        <IconBell size={16} />
        {unreadCount > 0 && (
          <span
            aria-live="polite"
            className="absolute -top-1 -right-1 flex min-h-5 min-w-5 items-center justify-center rounded-full border border-violet-950 bg-violet-500 px-1 text-[10px] font-bold text-white shadow-md shadow-violet-500/40"
          >
            {formatBadge(unreadCount)}
          </span>
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Notifications"
          className="absolute top-full right-0 z-50 mt-2 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/95 shadow-2xl backdrop-blur-xl sm:w-96"
        >
          <div className="flex items-center justify-between border-b border-white/8 px-4 py-3">
            <span className="text-xs font-bold tracking-tight text-white uppercase">
              Notifications
            </span>
            <button
              type="button"
              onClick={() => void handleMarkAll()}
              disabled={markingAll || unreadCount === 0}
              className="flex cursor-pointer items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold text-violet-300 transition-colors hover:bg-violet-500/10 hover:text-violet-200 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {markingAll ? (
                <IconLoader2 size={12} className="animate-spin motion-reduce:animate-none" />
              ) : (
                <IconCheck size={12} />
              )}
              Mark all as read
            </button>
          </div>

          <div aria-live="polite">
            {loadingItems && (
              <div className="flex items-center justify-center gap-2 px-4 py-8 text-xs text-zinc-500">
                <IconLoader2 size={14} className="animate-spin motion-reduce:animate-none" />
                Loading notifications…
              </div>
            )}

            {!loadingItems && error && (
              <p role="alert" className="px-4 py-8 text-center text-xs text-rose-300">
                {error}
              </p>
            )}

            {!loadingItems && !error && items?.length === 0 && (
              <EmptyState
                icon={IconBell}
                title="No notifications yet"
                description="When someone mentions you in a review, it will show up here."
                compact
                className="m-3 border-0 bg-transparent"
              />
            )}

            {!loadingItems && !error && items && items.length > 0 && (
              <ul className="max-h-96 divide-y divide-white/6 overflow-y-auto">
                {items.map((item) => {
                  const actorName = actorDisplayName(item);
                  return (
                    <li key={item.id}>
                      <Link
                        href={item.href}
                        onClick={() => handleItemClick(item)}
                        className={`flex items-start gap-3 px-4 py-3 transition-colors hover:bg-white/4 ${
                          item.isRead ? 'opacity-60' : ''
                        }`}
                      >
                        {item.actor?.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.actor.image}
                            alt=""
                            className="size-9 shrink-0 rounded-full border border-white/10 object-cover"
                          />
                        ) : (
                          <div className="flex size-9 shrink-0 items-center justify-center rounded-full border border-violet-500/25 bg-violet-500/15 text-[11px] font-bold text-violet-300">
                            {createMonogram(actorName).slice(0, 2) || 'CU'}
                          </div>
                        )}
                        <span className="min-w-0 flex-1">
                          <span className="block text-xs leading-relaxed text-zinc-200">
                            {notificationText(item)}
                          </span>
                          <time
                            dateTime={notificationIsoTime(item)}
                            className="mt-0.5 block text-[11px] text-zinc-500"
                          >
                            {notificationTime(item)}
                          </time>
                        </span>
                        {!item.isRead && (
                          <span
                            aria-label="Unread"
                            className="mt-1.5 size-2 shrink-0 rounded-full bg-violet-400"
                          />
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
