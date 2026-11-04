'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { IconLoader2, IconUser } from '@tabler/icons-react';
import { NotificationBell } from '@/modules/notifications/components/NotificationBell';
import type { HeaderActionsProps } from '@/shared/types/header';

/** Interactive account actions: bell, profile link, sign-in/out. */
export const HeaderActions = ({ isAuthenticated }: HeaderActionsProps) => {
  const pathname = usePathname();
  const [signingOut, setSigningOut] = useState(false);

  const isActiveRoute = (href: string) =>
    href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);

  const handleSignOut = () => {
    if (signingOut) return;
    setSigningOut(true);
    void signOut({ redirectTo: '/login' });
  };

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
          <button
            type="button"
            onClick={handleSignOut}
            disabled={signingOut}
            className="flex items-center gap-1.5 rounded-full border border-white/8 px-4 py-2 text-xs font-semibold text-zinc-400 transition-colors hover:text-white disabled:cursor-wait disabled:opacity-60"
          >
            {signingOut && <IconLoader2 size={13} className="animate-spin" />}
            {signingOut ? 'Signing out…' : 'Sign out'}
          </button>
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
