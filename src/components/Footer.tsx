'use client';

import Link from 'next/link';
import { navigation } from '@/lib/navigation';
import { usePathname } from 'next/navigation';

export const Footer = () => {
  const pathname = usePathname();
  const isActiveRoute = (href: string) =>
    href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <footer className="fixed right-4 bottom-5 left-4 z-40 md:hidden">
      <div className="grid h-14 grid-cols-3 rounded-full border border-white/12 bg-zinc-900/90 p-1 shadow-2xl shadow-black/90 backdrop-blur-2xl">
        {navigation.map((item) => {
          const Icon = item.icon;
          const activeTab = isActiveRoute(item.href);

          return (
            <Link
              key={item.id}
              href={item.href}
              className={`flex cursor-pointer flex-col items-center justify-center rounded-full transition-all ${
                activeTab
                  ? 'bg-violet-500 font-bold text-white shadow-md shadow-violet-500/25'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Icon size={14} className={activeTab ? 'text-gold-400' : 'text-zinc-500'} />
              <span className="text-[9px]">{item.title}</span>
            </Link>
          );
        })}
      </div>
    </footer>
  );
};
