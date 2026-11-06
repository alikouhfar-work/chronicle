'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { IconUser } from '@tabler/icons-react';
import { NotificationBell } from '@/modules/notifications/components/NotificationBell';
import type { HeaderActionsProps } from '@/app/_components/types/header';

/**
 * Interactive account actions: notification bell and profile link.
 * Signing out lives on the profile page, not in the global chrome.
 */
export const HeaderActions = ({ isAuthenticated }: HeaderActionsProps) => {
  const pathname = usePathname();

  const isActiveRoute = (href: string) =>
    href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <div className="flex items-center gap-2">
      {isAuthenticated ? (
        <>
          <NotificationBell />
          <Link
            href="/settings/profile"
            aria-label="Profile settings"
            title="Profile settings"
            aria-current={isActiveRoute('/settings/profile') ? 'page' : undefined}
            className={`flex size-9 items-center justify-center rounded-pill border transition-colors ${
              isActiveRoute('/settings/profile')
                ? 'border-accent-ink bg-accent-bright/15 text-accent-ink'
                : 'border-line text-ink-muted hover:border-accent-ink hover:text-ink'
            }`}
          >
            <IconUser size={16} />
          </Link>
        </>
      ) : (
        <Link
          href="/login"
          className="apple-pill-btn border border-accent-ink bg-accent-bright/15 px-4 py-2 text-xs font-bold text-accent-tint hover:bg-accent-bright/25"
        >
          Sign in
        </Link>
      )}
    </div>
  );
};
