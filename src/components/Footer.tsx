'use client'

import Link from "next/link";
import { navigation } from '@/lib/navigation';
import { usePathname } from 'next/navigation';

export const Footer = () => {
  const pathname = usePathname();

    return (
      <footer className="border-zinc-850 sticky bottom-0 z-30 border-t bg-zinc-950/95 backdrop-blur-md md:hidden">
        <div className="grid h-16 grid-cols-3">
          {navigation.map((item) => {
            const Icon = item.icon;
            const activeTab = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);

            return (
              <Link
                key={item.id}
                href={item.href}
                className={`flex cursor-pointer flex-col items-center justify-center space-y-1 font-mono text-[10px] uppercase transition-colors ${
                  activeTab ? 'text-gold-400' : 'text-zinc-500'
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
}