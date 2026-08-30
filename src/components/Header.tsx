'use client';

import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { navigation } from '@/lib/navigation';
import Link from 'next/link';

export const Header = () => {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-white/8 bg-canvas/80 px-4 py-3.5 shadow-xl backdrop-blur-2xl transition-all duration-300 sm:px-6 lg:px-8">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between">
        {/* Masthead Brand */}
        <div className="group flex cursor-pointer items-center space-x-3 select-none">
          <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-linear-to-br from-zinc-800 to-zinc-950 p-1 shadow-lg transition-all duration-300 group-hover:border-violet-500/50 group-hover:shadow-violet-500/20">
            <div className="absolute inset-0 bg-violet-500/10 opacity-0 transition-opacity group-hover:opacity-100" />
            <Image
              width="40"
              height="40"
              alt="Chronicle Logo"
              src="/icons/logo.svg"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white transition-colors group-hover:text-violet-400">
                Chronicle
              </h1>
              <span className="apple-badge hidden border border-violet-500/25 bg-violet-500/15 text-[11px] text-violet-400 sm:inline-flex">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-violet-400" />
                Tracker
              </span>
            </div>
            <p className="text-xs font-medium text-zinc-400">Cinema & Series Companion</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center rounded-full border border-white/8 bg-zinc-900/80 p-1 shadow-inner backdrop-blur-xl">
          {navigation.map((item) => {
            const Icon = item.icon;
            const activeTab = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);

            return (
              <Link
                key={item.id}
                href={item.href}
                className={`flex cursor-pointer items-center space-x-2 rounded-full px-5 py-2 text-xs font-semibold tracking-tight transition-all duration-200 ${
                  activeTab
                    ? 'scale-100 bg-violet-500 font-bold text-white shadow-md shadow-violet-500/25'
                    : 'text-zinc-400 hover:bg-white/4 hover:text-white'
                }`}
              >
                <Icon size={14} className={activeTab ? 'text-white' : 'text-zinc-400'} />
                <span>{item.title}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
