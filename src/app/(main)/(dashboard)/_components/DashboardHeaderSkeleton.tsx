import { FC } from 'react';
import { getTrackedShows } from '@/features/show';
import { getTrackedMovies } from '@/features/movie';
import { DashboardHeaderWatchStats } from '@/app/(main)/(dashboard)/_components/DashboardHeaderWatchStats';

export const DashboardHeader: FC = async () => {
  const [trackedShows, trackedMovies] = await Promise.all([getTrackedShows(), getTrackedMovies()]);

  return (
    <header className="border-zinc-850 relative overflow-hidden rounded-2xl border bg-linear-to-br from-zinc-900/90 via-zinc-950 to-zinc-900 p-8 shadow-2xl md:p-10">
      <div className="bg-gold-500/5 pointer-events-none absolute top-0 left-1/4 h-96 w-96 rounded-full blur-3xl" />
      <div className="pointer-events-none absolute right-1/4 bottom-0 h-96 w-96 rounded-full bg-purple-500/5 blur-3xl" />

      <div className="relative z-10 grid grid-cols-1 items-center gap-8 md:grid-cols-3">
        <div className="space-y-5 md:col-span-2">
          <div className="bg-gold-400/10 border-gold-400/20 text-gold-400 inline-flex animate-pulse items-center gap-2 rounded-full border px-3 py-1 font-mono text-[10px] font-extrabold tracking-widest uppercase">
            <span className="bg-gold-400 h-1.5 w-1.5 rounded-full"></span>
            Personal Media Chronicle
          </div>
          <h2 className="bg-linear-to-r from-white via-zinc-100 to-zinc-300 bg-clip-text font-serif text-3xl leading-tight font-black tracking-tight text-transparent md:text-5xl">
            Your Chronicle, Your Story.
          </h2>
          <p className="max-w-xl text-xs leading-relaxed font-normal text-zinc-400 md:text-sm">
            Welcome to your distraction-free personal space. Keep track of what you are currently
            watching, see beautifully detailed stats on your watch histories, and discover what is
            coming up next—completely stored locally in your browser.
          </p>
        </div>

        <DashboardHeaderWatchStats trackedShows={trackedShows} trackedMovies={trackedMovies} />
      </div>
    </header>
  );
};
