import { FC } from 'react';
import { getTrackedShows } from '@/features/show';
import { getTrackedMovies } from '@/features/movie';
import { DashboardHeaderWatchStats } from '@/app/(main)/(dashboard)/_components/DashboardHeaderWatchStats';
import { IconSparkles } from '@tabler/icons-react';

export const DashboardHeader: FC = async () => {
  const [trackedShows, trackedMovies] = await Promise.all([getTrackedShows(), getTrackedMovies()]);

  return (
    <section className="glass-panel relative overflow-hidden rounded-3xl border border-white/8 p-6 shadow-2xl sm:p-8 md:p-10">
      {/* Soft Ambient Colorful Radial Glows */}
      <div className="pointer-events-none absolute top-0 right-1/4 h-96 w-96 rounded-full bg-violet-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-10 left-10 h-80 w-80 rounded-full bg-indigo-500/10 blur-3xl" />

      <div className="relative z-10 grid grid-cols-1 items-center gap-8 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="apple-badge border border-white/10 bg-white/[0.08] text-zinc-200">
              <IconSparkles size={13} className="text-violet-400" />
              <span>Your Entertainment Hub</span>
            </div>
          </div>

          <h2 className="text-3xl leading-[1.1] font-extrabold tracking-tight text-white sm:text-4xl md:text-5xl">
            Track what you love, <br />
            <span className="bg-gradient-to-r from-violet-400 via-indigo-300 to-indigo-400 bg-clip-text text-transparent">
              effortlessly.
            </span>
          </h2>

          <p className="max-w-xl text-sm leading-relaxed font-normal text-zinc-400 md:text-base">
            Keep track of series progress, record your movie watches, and stay updated on upcoming
            release seasons.
          </p>
        </div>

        {/* Right-hand Apple Humanist Glass Stats Widget */}
        <DashboardHeaderWatchStats trackedShows={trackedShows} trackedMovies={trackedMovies} />
      </div>
    </section>
  );
};
