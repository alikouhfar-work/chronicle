'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { navigation } from '@/shared/lib/navigation';

/**
 * Interactive client leaf: mobile bottom navigation. Everything around it
 * (layout shell, page content) stays on the server.
 */
export const Footer = () => {
  const pathname = usePathname();
  const isActiveRoute = (href: string) =>
    href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <footer className="fixed right-4 bottom-5 left-4 z-40 md:hidden">
      <div className="grid h-14 grid-cols-3 rounded-pill border border-line bg-surface-raised/90 p-1 shadow-2xl shadow-black/90 backdrop-blur-2xl">
        {navigation.map((item) => {
          const Icon = item.icon;
          const activeTab = isActiveRoute(item.href);

          return (
            <Link
              key={item.id}
              href={item.href}
              className={`flex cursor-pointer flex-col items-center justify-center rounded-pill transition-all ${
                activeTab
                  ? 'bg-accent font-bold text-ink shadow-card shadow-accent/25'
                  : 'text-ink-muted hover:text-ink'
              }`}
            >
              <Icon size={14} className={activeTab ? 'text-gold-400' : 'text-ink-subtle'} />
              <span className="text-micro">{item.title}</span>
            </Link>
          );
        })}
      </div>
    </footer>
  );
};
