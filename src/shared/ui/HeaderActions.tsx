'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { IconUser } from '@tabler/icons-react';
import { NotificationBell } from '@/modules/notifications/components/NotificationBell';
import type { HeaderActionsProps } from '@/shared/types/header';

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
            className={`flex size-9 items-center justify-center rounded-full border transition-colors ${
              isActiveRoute('/settings/profile')
                ? 'border-violet-400/50 bg-violet-500/15 text-violet-300'
                : 'border-white/8 text-zinc-400 hover:border-violet-400/40 hover:text-white'
            }`}
          >
            <IconUser size={16} />
          </Link>
        </>
      ) : (
        <Link
          href="/login"
          className="apple-pill-btn border border-violet-400/40 bg-violet-500/15 px-4 py-2 text-xs font-bold text-violet-200 hover:bg-violet-500/25"
        >
          Sign in
        </Link>
      )}
    </div>
  );
};
