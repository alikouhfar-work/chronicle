'use server';

import { prisma } from '@/infra/db/prisma';
import { requireUserId } from '@/infra/tmdb/forUser';
import { publicUserSelect } from '@/modules/user/lib/publicUser';
import { NOTIFICATION_LIST_LIMIT } from '@/modules/notifications/constants';
import type {
  NotificationItem,
  NotificationListResult,
  UnreadCountResult,
} from '@/modules/notifications/types';
import type { CommentMediaType } from '@/modules/comments/types';

const toAppMediaType = (value: string): CommentMediaType => {
  // Prisma hands back the enum *name* ("SHOW"), but rows written by older
  // clients have shown up with the mapped label ("show") — compare loosely.
  const normalized = typeof value === 'string' ? value.toUpperCase() : '';
  if (normalized === 'SHOW') return 'show';
  if (normalized === 'EPISODE') return 'episode';
  return 'movie';
};

const movieHref = (tmdbId: number, commentId: string, commentAvailable: boolean): string =>
  commentAvailable
    ? `/library/movie/${tmdbId}?tab=reviews#comment-${commentId}`
    : `/library/movie/${tmdbId}?tab=reviews&mention=unavailable`;

// Library detail routes are `/library/tv/[tmdbId]` — `/library/show/...` 404s.
const showHref = (tmdbId: number, commentId: string, commentAvailable: boolean): string =>
  commentAvailable
    ? `/library/tv/${tmdbId}?tab=reviews#comment-${commentId}`
    : `/library/tv/${tmdbId}?tab=reviews&mention=unavailable`;

const episodeHref = (
  showTmdbId: number | null,
  episodeDbId: string | null,
  commentId: string,
  commentAvailable: boolean,
): string => {
  // The episode page is keyed by the internal episode id, which only exists
  // in libraries that track the episode. When the recipient's copy (or every
  // copy) is gone, fall back to the parent show page. A deleted comment
  // degrades to the media page with a notice instead of a comment anchor.
  if (showTmdbId !== null && episodeDbId !== null && commentAvailable) {
    return `/library/tv/${showTmdbId}/episode/${episodeDbId}?tab=reviews#comment-${commentId}`;
  }
  if (showTmdbId !== null) {
    return `/library/tv/${showTmdbId}?tab=reviews&mention=unavailable`;
  }
  return '/library?mention=unavailable';
};

import type { NotificationRow } from '@/modules/notifications/types/notificationRow';
const withHrefs = async (userId: string, rows: NotificationRow[]): Promise<NotificationItem[]> => {
  const episodeTmdbIds = [...new Set(rows.filter((row) => row.mediaType === 'EPISODE').map((row) => row.tmdbId))];

  const recipientEpisodes = new Map<number, { id: string; showTmdbId: number }>();
  const anyOwnerShowTmdbId = new Map<number, number>();
  if (episodeTmdbIds.length > 0) {
    const [owned, unscoped] = await Promise.all([
      prisma.episode.findMany({
        where: { tmdbId: { in: episodeTmdbIds }, season: { show: { userId } } },
        select: { tmdbId: true, id: true, season: { select: { show: { select: { tmdbId: true } } } } },
      }),
      prisma.episode.findMany({
        where: { tmdbId: { in: episodeTmdbIds } },
        select: { tmdbId: true, season: { select: { show: { select: { tmdbId: true } } } } },
      }),
    ]);
    for (const episode of owned) {
      recipientEpisodes.set(episode.tmdbId, {
        id: episode.id,
        showTmdbId: episode.season.show.tmdbId,
      });
    }
    for (const episode of unscoped) {
      if (!anyOwnerShowTmdbId.has(episode.tmdbId)) {
        anyOwnerShowTmdbId.set(episode.tmdbId, episode.season.show.tmdbId);
      }
    }
  }

  return rows.map((row) => {
    const mediaType = toAppMediaType(row.mediaType);
    const commentAvailable = row.comment !== null && row.comment.deletedAt === null;
    let href: string;
    if (mediaType === 'movie') {
      href = movieHref(row.tmdbId, row.commentId, commentAvailable);
    } else if (mediaType === 'show') {
      href = showHref(row.tmdbId, row.commentId, commentAvailable);
    } else {
      const owned = recipientEpisodes.get(row.tmdbId);
      const showTmdbId = owned?.showTmdbId ?? anyOwnerShowTmdbId.get(row.tmdbId) ?? null;
      href = episodeHref(showTmdbId, owned?.id ?? null, row.commentId, commentAvailable);
    }
    return {
      id: row.id,
      isRead: row.isRead,
      createdAt: row.createdAt,
      actor: row.actor,
      mediaType,
      tmdbId: row.tmdbId,
      mediaTitle: row.mediaTitle,
      commentId: row.commentId,
      commentAvailable,
      href,
    };
  });
};

export const listNotifications = async (): Promise<NotificationListResult> => {
  let userId: string;
  try {
    userId = await requireUserId();
  } catch {
    return { success: false, error: 'You must be signed in to view notifications.', notifications: [] };
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

    return { success: true, notifications: await withHrefs(userId, rows) };
  } catch (error) {
    console.error('listNotifications error:', error);
    return { success: false, error: 'Could not load notifications.', notifications: [] };
  }
};

export const getUnreadCount = async (): Promise<UnreadCountResult> => {
  let userId: string;
  try {
    userId = await requireUserId();
  } catch {
    return { success: false, error: 'You must be signed in to view notifications.', unreadCount: 0 };
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
