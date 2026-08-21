'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { navigation } from '@/lib/navigation';
import Image from 'next/image';

export const Header = () => {
  const pathname = usePathname();

  return (
    <header className="border-zinc-850 sticky top-0 z-30 border-b bg-zinc-950/80 backdrop-blur-lg">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="group flex items-center space-x-4 select-none">
          <Image
            width="40"
            height="40"
            alt="Chronicle Logo"
            src="/icons/logo.svg"
            referrerPolicy="no-referrer"
          />
          <div>
            <h1 className="to-gold-300 group-hover:to-gold-400 bg-linear-to-r from-white via-zinc-100 bg-clip-text font-serif text-2xl font-extrabold tracking-tight text-transparent transition-all duration-300">
              Chronicle
            </h1>
            <p className="mt-0.5 font-mono text-[9px] font-semibold tracking-[0.25em] text-zinc-500 uppercase">
              Personal Media Archive
            </p>
          </div>
        </div>

        <nav className="border-zinc-850/80 hidden items-center space-x-1.5 rounded-xl border bg-zinc-900/40 p-1 md:flex">
          {navigation.map((item) => {
            const Icon = item.icon;
            const activeTab = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);

            return (
              <Link
                key={item.id}
                href={item.href}
                className={`flex cursor-pointer items-center space-x-2 rounded-lg px-4.5 py-2 font-mono text-xs tracking-wider uppercase transition-all duration-200 ${
                  activeTab
                    ? 'text-gold-400 border border-zinc-700/40 bg-zinc-800/90 font-bold shadow-md shadow-black/20'
                    : 'border border-transparent text-zinc-400 hover:bg-zinc-900/30 hover:text-zinc-200'
                }`}
              >
                <Icon size={14} className={activeTab ? 'text-gold-400' : 'text-zinc-500'} />
                <span>{item.title}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
