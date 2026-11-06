'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { IconLoader2 } from '@tabler/icons-react';
import { navigation } from '@/shared/lib/navigation';

/** Interactive navigation tabs: active-route + pending-navigation state only. */
export const HeaderNav = () => {
  const pathname = usePathname();
  // Pending navigation is derived, never stored-then-cleared: a stored flag
  // would need a render-phase or effect write, and both re-render the header
  // on every server-action payload (the refresh loop we just fixed).
  const [pending, setPending] = useState<{ href: string; from: string } | null>(null);

  const isActiveRoute = (href: string) =>
    href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <nav className="hidden items-center rounded-pill border border-line bg-surface-raised/80 p-1 shadow-inner backdrop-blur-xl md:flex">
      {navigation.map((item) => {
        const Icon = item.icon;
        const activeTab = isActiveRoute(item.href);
        const isPendingNav = pending?.href === item.href && pending.from === pathname;

        return (
          <Link
            key={item.id}
            href={item.href}
            aria-current={activeTab ? 'page' : undefined}
            aria-busy={isPendingNav}
            onClick={() => {
              if (item.href !== pathname) setPending({ href: item.href, from: pathname });
            }}
            className={`flex cursor-pointer items-center space-x-2 rounded-pill px-5 py-2 text-xs font-semibold tracking-tight transition-all duration-200 ${
              isPendingNav ? 'animate-pulse opacity-70' : ''
            } ${
              activeTab
                ? 'scale-100 bg-accent font-bold text-ink shadow-card shadow-accent/25'
                : 'text-ink-muted hover:bg-surface-soft hover:text-ink'
            }`}
          >
            {isPendingNav ? (
              <IconLoader2 size={14} className="animate-spin" />
            ) : (
              <Icon size={14} className={activeTab ? 'text-ink' : 'text-ink-muted'} />
            )}
            <span>{item.title}</span>
          </Link>
        );
      })}
    </nav>
  );
};
