import Image from 'next/image';
import type { HeaderProps } from '@/shared/types/header';
import { HeaderActions } from '@/shared/ui/HeaderActions';
import { HeaderNav } from '@/shared/ui/HeaderNav';

/**
 * Server Component: static masthead chrome. The two interactive islands
 * (navigation tabs and account actions) are the only client boundaries,
 * pushed to the leaves of the header tree.
 */
export const Header = ({ isAuthenticated = true }: HeaderProps) => {
  return (
    <header className="bg-canvas/80 sticky top-0 z-40 border-b border-white/8 py-3.5 shadow-xl backdrop-blur-2xl transition-all duration-300">
      <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Masthead Brand */}
        <div className="group flex cursor-pointer items-center space-x-3 select-none">
          <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-zinc-900 p-0.5 shadow-lg shadow-black/40 transition-all duration-300 group-hover:scale-105 group-hover:border-violet-400/50 group-hover:shadow-violet-500/25">
            <div className="absolute inset-0 bg-violet-500/10 opacity-0 transition-opacity group-hover:opacity-100" />
            <Image
              width="40"
              height="40"
              alt="Chronicle Logo"
              src="/icons/logo.png"
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

        <HeaderNav />

        <HeaderActions isAuthenticated={isAuthenticated} />
      </div>
    </header>
  );
};
