import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  findManyNotifications: vi.fn(),
  countNotifications: vi.fn(),
  updateManyNotifications: vi.fn(),
  findManyEpisodes: vi.fn(),
  requireUserId: vi.fn(),
}));

vi.mock('@/infra/db/prisma', () => ({
  prisma: {
    notification: {
      findMany: mocks.findManyNotifications,
      count: mocks.countNotifications,
      updateMany: mocks.updateManyNotifications,
    },
    episode: { findMany: mocks.findManyEpisodes },
  },
}));

vi.mock('@/infra/tmdb/forUser', () => ({
  requireUserId: mocks.requireUserId,
}));

import {
  getUnreadCount,
  listNotifications,
} from '@/modules/notifications/queries/notifications';
import {
  markAllNotificationsRead,
  markNotificationRead,
} from '@/modules/notifications/actions/notifications';

const actor = { id: 'actor-1', username: 'alice', name: 'Alice Adams', image: null };

const notificationRow = (overrides: Record<string, unknown> = {}) => ({
  id: 'notif-1',
  isRead: false,
  createdAt: new Date('2026-11-01T12:00:00Z'),
  recipientId: 'user-1',
  actor,
  mediaType: 'MOVIE',
  tmdbId: 550,
  mediaTitle: 'Test Movie',
  commentId: 'comment-1',
  comment: { deletedAt: null },
  ...overrides,
});

describe('notification services', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireUserId.mockResolvedValue('user-1');
    mocks.findManyEpisodes.mockResolvedValue([]);
  });

  it('requires authentication for every operation', async () => {
    mocks.requireUserId.mockRejectedValue(new Error('signed out'));

    const list = await listNotifications();
    const count = await getUnreadCount();
    const mark = await markNotificationRead('notif-1');
    const markAll = await markAllNotificationsRead();

    expect(list.success).toBe(false);
    expect(list.notifications).toEqual([]);
    expect(count.success).toBe(false);
    expect(count.unreadCount).toBe(0);
    expect(mark.success).toBe(false);
    expect(markAll.success).toBe(false);
    expect(mocks.findManyNotifications).not.toHaveBeenCalled();
    expect(mocks.countNotifications).not.toHaveBeenCalled();
    expect(mocks.updateManyNotifications).not.toHaveBeenCalled();
  });

  it('lists the latest 8 notifications scoped to the recipient', async () => {
    mocks.findManyNotifications.mockResolvedValue([notificationRow()]);

    const result = await listNotifications();

    expect(result.success).toBe(true);
    expect(mocks.findManyNotifications).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { recipientId: 'user-1' },
        take: 8,
      }),
    );
    expect(result.notifications).toHaveLength(1);
    expect(result.notifications[0]).toMatchObject({
      id: 'notif-1',
      mediaTitle: 'Test Movie',
      href: '/library/movie/550?tab=reviews#comment-comment-1',
      commentAvailable: true,
    });
  });

  it('links a deleted comment to the media page with an unavailable flag', async () => {
    mocks.findManyNotifications.mockResolvedValue([
      notificationRow({ comment: { deletedAt: new Date() } }),
    ]);

    const result = await listNotifications();

    expect(result.notifications[0]?.commentAvailable).toBe(false);
    expect(result.notifications[0]?.href).toBe('/library/movie/550?tab=reviews&mention=unavailable');
  });

  it('routes show notifications to the show page', async () => {
    mocks.findManyNotifications.mockResolvedValue([
      notificationRow({ mediaType: 'SHOW', tmdbId: 95396, mediaTitle: 'Severance' }),
    ]);

    const result = await listNotifications();

    expect(result.notifications[0]?.href).toBe('/library/show/95396?tab=reviews#comment-comment-1');
  });

  it('routes episode notifications to the recipient episode page with one batched lookup', async () => {
    mocks.findManyNotifications.mockResolvedValue([
      notificationRow({ mediaType: 'EPISODE', tmdbId: 1982925, mediaTitle: 'Pilot' }),
    ]);
    mocks.findManyEpisodes.mockResolvedValue([
      { tmdbId: 1982925, id: 'episode-db-1', season: { show: { tmdbId: 95396 } } },
    ]);

    const result = await listNotifications();

    expect(result.notifications[0]?.href).toBe(
      '/library/tv/95396/episode/episode-db-1?tab=reviews#comment-comment-1',
    );
    expect(mocks.findManyEpisodes).toHaveBeenCalledTimes(2);
  });

  it('falls back to the show page when the recipient episode copy is gone', async () => {
    mocks.findManyNotifications.mockResolvedValue([
      notificationRow({ mediaType: 'EPISODE', tmdbId: 1982925, mediaTitle: 'Pilot' }),
    ]);
    // Recipient owns nothing; another owner's row still reveals the show.
    mocks.findManyEpisodes.mockImplementation((args: { where: { tmdbId?: { in: number[] } } }) =>
      args.where.tmdbId ? [{ tmdbId: 1982925, season: { show: { tmdbId: 95396 } } }] : [],
    );

    const result = await listNotifications();

    expect(result.notifications[0]?.href).toBe('/library/tv/95396?tab=reviews&mention=unavailable');
  });

  it('marks a notification read only when it belongs to the viewer', async () => {
    mocks.updateManyNotifications.mockResolvedValue({ count: 1 });

    const result = await markNotificationRead('notif-1');

    expect(result.success).toBe(true);
    // The recipient scope is the whole cross-account guarantee: one user can
    // never flip another user's rows, even knowing their ids.
    expect(mocks.updateManyNotifications).toHaveBeenCalledWith({
      where: { id: 'notif-1', recipientId: 'user-1', isRead: false },
      data: { isRead: true },
    });
  });

  it('reports a miss when the notification belongs to someone else', async () => {
    mocks.updateManyNotifications.mockResolvedValue({ count: 0 });

    const result = await markNotificationRead('other-users-notif');

    expect(result.success).toBe(false);
    expect(result.error).toBe('Notification not found.');
  });

  it('marks every unread notification of the viewer as read, nobody else’s', async () => {
    mocks.updateManyNotifications.mockResolvedValue({ count: 3 });

    const result = await markAllNotificationsRead();

    expect(result.success).toBe(true);
    expect(mocks.updateManyNotifications).toHaveBeenCalledWith({
      where: { recipientId: 'user-1', isRead: false },
      data: { isRead: true },
    });
  });

  it('counts unread notifications for the badge', async () => {
    mocks.countNotifications.mockResolvedValue(12);

    const result = await getUnreadCount();

    expect(result).toEqual({ success: true, unreadCount: 12 });
    expect(mocks.countNotifications).toHaveBeenCalledWith({
      where: { recipientId: 'user-1', isRead: false },
    });
  });
});
