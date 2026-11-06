import Image from 'next/image';
import type { HeaderProps } from '@/app/_components/types/header';
import { HeaderActions } from '@/app/_components/HeaderActions';
import { HeaderNav } from '@/app/_components/HeaderNav';

/**
 * Server Component: static masthead chrome. The two interactive islands
 * (navigation tabs and account actions) are the only client boundaries,
 * pushed to the leaves of the header tree.
 */
export const Header = ({ isAuthenticated = true }: HeaderProps) => {
  return (
    <header className="bg-canvas/80 sticky top-0 z-40 border-b border-line py-3.5 shadow-xl backdrop-blur-2xl transition-all duration-300">
      <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Masthead Brand */}
        <div className="group flex cursor-pointer items-center space-x-3 select-none">
          <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-control border border-line bg-surface-raised p-0.5 shadow-lg shadow-black/40 transition-all duration-300 group-hover:scale-105 group-hover:border-accent-ink group-hover:shadow-accent/25">
            <div className="absolute inset-0 bg-accent-bright/10 opacity-0 transition-opacity group-hover:opacity-100" />
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
              <h1 className="text-xl font-bold tracking-tight text-ink transition-colors group-hover:text-accent-ink">
                Chronicle
              </h1>
              <span className="apple-badge hidden border border-accent-line bg-accent-bright/15 text-micro text-accent-ink sm:inline-flex">
                <span className="h-1.5 w-1.5 animate-pulse rounded-pill bg-accent-strong" />
                Tracker
              </span>
            </div>
            <p className="text-xs font-medium text-ink-muted">Cinema & Series Companion</p>
          </div>
        </div>

        <HeaderNav />

        <HeaderActions isAuthenticated={isAuthenticated} />
      </div>
    </header>
  );
};
