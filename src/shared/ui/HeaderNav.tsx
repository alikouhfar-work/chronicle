'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { IconLoader2 } from '@tabler/icons-react';
import { navigation } from '@/shared/lib/navigation';

/** Interactive navigation tabs: active-route + pending-navigation state only. */
export const HeaderNav = () => {
  const pathname = usePathname();
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const [prevPathname, setPrevPathname] = useState(pathname);

  const isActiveRoute = (href: string) =>
    href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);

  // Clear the pending nav state once the route transition lands.
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setPendingHref(null);
  }

  return (
    <nav className="hidden items-center rounded-full border border-white/8 bg-zinc-900/80 p-1 shadow-inner backdrop-blur-xl md:flex">
      {navigation.map((item) => {
        const Icon = item.icon;
        const activeTab = isActiveRoute(item.href);
        const isPendingNav = pendingHref === item.href;

        return (
          <Link
            key={item.id}
            href={item.href}
            aria-current={activeTab ? 'page' : undefined}
            aria-busy={isPendingNav}
            onClick={() => {
              if (item.href !== pathname) setPendingHref(item.href);
            }}
            className={`flex cursor-pointer items-center space-x-2 rounded-full px-5 py-2 text-xs font-semibold tracking-tight transition-all duration-200 ${
              isPendingNav ? 'animate-pulse opacity-70' : ''
            } ${
              activeTab
                ? 'scale-100 bg-violet-500 font-bold text-white shadow-md shadow-violet-500/25'
                : 'text-zinc-400 hover:bg-white/4 hover:text-white'
            }`}
          >
            {isPendingNav ? (
              <IconLoader2 size={14} className="animate-spin" />
            ) : (
              <Icon size={14} className={activeTab ? 'text-white' : 'text-zinc-400'} />
            )}
            <span>{item.title}</span>
          </Link>
        );
      })}
    </nav>
  );
};
