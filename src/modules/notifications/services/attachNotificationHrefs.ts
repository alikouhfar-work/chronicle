import 'server-only';

import { prisma } from '@/infra/db/prisma';
import {
  buildEpisodeNotificationHref,
  buildMovieNotificationHref,
  buildShowNotificationHref,
  toAppMediaType,
} from '@/modules/notifications/lib/notificationHrefs';
import type { NotificationItem } from '@/modules/notifications/types';
import type { NotificationRow } from '@/modules/notifications/types/notificationRow';

/**
 * Resolves the deep link for each notification row: movies and shows by TMDB
 * id, episodes through the internal id when the recipient tracks that episode.
 */
export const attachNotificationHrefs = async (
  userId: string,
  rows: NotificationRow[],
): Promise<NotificationItem[]> => {
  const episodeTmdbIds = [
    ...new Set(rows.filter((row) => row.mediaType === 'EPISODE').map((row) => row.tmdbId)),
  ];

  const recipientEpisodes = new Map<number, { id: string; showTmdbId: number }>();
  const anyOwnerShowTmdbId = new Map<number, number>();

  if (episodeTmdbIds.length > 0) {
    const [owned, unscoped] = await Promise.all([
      prisma.episode.findMany({
        where: { tmdbId: { in: episodeTmdbIds }, season: { show: { userId } } },
        select: {
          tmdbId: true,
          id: true,
          season: { select: { show: { select: { tmdbId: true } } } },
        },
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
      href = buildMovieNotificationHref(row.tmdbId, row.commentId, commentAvailable);
    } else if (mediaType === 'show') {
      href = buildShowNotificationHref(row.tmdbId, row.commentId, commentAvailable);
    } else {
      const owned = recipientEpisodes.get(row.tmdbId);
      const showTmdbId = owned?.showTmdbId ?? anyOwnerShowTmdbId.get(row.tmdbId) ?? null;
      href = buildEpisodeNotificationHref(
        showTmdbId,
        owned?.id ?? null,
        row.commentId,
        commentAvailable,
      );
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
