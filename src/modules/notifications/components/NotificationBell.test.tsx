import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getUnreadCount: vi.fn(),
  listNotifications: vi.fn(),
  markNotificationRead: vi.fn(),
  markAllNotificationsRead: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  usePathname: () => '/library/movie/550',
}));

vi.mock('@/modules/notifications/services/notifications', () => mocks);

import { NotificationBell } from '@/modules/notifications/components/NotificationBell';

const item = (overrides: Record<string, unknown> = {}) => ({
  id: 'notif-1',
  isRead: false,
  createdAt: new Date('2026-11-01T12:00:00Z'),
  actor: { id: 'actor-1', username: 'alice', name: 'Alice Adams', image: null },
  mediaType: 'movie',
  tmdbId: 550,
  mediaTitle: 'Test Movie',
  commentId: 'comment-1',
  commentAvailable: true,
  href: '/library/movie/550?tab=reviews#comment-comment-1',
  ...overrides,
});

describe('NotificationBell', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getUnreadCount.mockResolvedValue({ success: true, unreadCount: 0 });
    mocks.listNotifications.mockResolvedValue({ success: true, notifications: [] });
    mocks.markNotificationRead.mockResolvedValue({ success: true });
    mocks.markAllNotificationsRead.mockResolvedValue({ success: true });
  });

  it('announces the unread count and caps the badge at 9+', async () => {
    mocks.getUnreadCount.mockResolvedValue({ success: true, unreadCount: 12 });
    render(<NotificationBell />);

    const button = await screen.findByRole('button', { name: /notifications, 12 unread/i });
    expect(button).toBeInTheDocument();
    expect(within(button).getByText('9+')).toHaveAttribute('aria-live', 'polite');
  });

  it('is keyboard reachable with no badge when everything is read', async () => {
    render(<NotificationBell />);

    const button = await screen.findByRole('button', { name: 'Notifications' });
    expect(button).toBeInTheDocument();
    button.focus();
    expect(document.activeElement).toBe(button);
  });

  it('renders the mention text, optimistic read, and an empty state', async () => {
    mocks.getUnreadCount.mockResolvedValue({ success: true, unreadCount: 1 });
    mocks.listNotifications.mockResolvedValue({ success: true, notifications: [item()] });
    render(<NotificationBell />);

    fireEvent.click(await screen.findByRole('button', { name: /1 unread/i }));

    await screen.findByText('Alice Adams mentioned you in a comment on Test Movie');
    // Optimistic read drops the badge immediately without a reload.
    fireEvent.click(screen.getByText('Alice Adams mentioned you in a comment on Test Movie'));
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Notifications' })).toBeInTheDocument(),
    );
    expect(mocks.markNotificationRead).toHaveBeenCalledWith('notif-1');
    expect(screen.queryByText('9+')).not.toBeInTheDocument();
  });

  it('marks all as read and reverts on failure', async () => {
    mocks.getUnreadCount.mockResolvedValue({ success: true, unreadCount: 2 });
    mocks.listNotifications.mockResolvedValue({
      success: true,
      notifications: [item(), item({ id: 'notif-2' })],
    });
    mocks.markAllNotificationsRead.mockResolvedValueOnce({ success: false });
    render(<NotificationBell />);

    fireEvent.click(await screen.findByRole('button', { name: /2 unread/i }));
    await screen.findAllByText('Alice Adams mentioned you in a comment on Test Movie');

    fireEvent.click(screen.getByRole('button', { name: /mark all as read/i }));
    await waitFor(() => expect(mocks.markAllNotificationsRead).toHaveBeenCalled());
    // Reverted: the badge is back because the server call failed.
    expect(await screen.findByRole('button', { name: /2 unread/i })).toBeInTheDocument();
  });

  it('shows the empty state when there is nothing to catch up on', async () => {
    render(<NotificationBell />);

    fireEvent.click(await screen.findByRole('button', { name: 'Notifications' }));
    expect(await screen.findByText(/no notifications yet/i)).toBeInTheDocument();
  });
});
