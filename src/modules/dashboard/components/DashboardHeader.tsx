import { DashboardHeaderWatchStats } from '@/modules/dashboard/components/DashboardHeaderWatchStats';
import { IconSparkles } from '@tabler/icons-react';
import { getTrackedShows } from '@/modules/show/services/getTrackedShows';
import { getTrackedMovies } from '@/modules/movie/services/getTrackedMovies';

export const DashboardHeader = async () => {
  const [trackedShows, trackedMovies] = await Promise.all([getTrackedShows(), getTrackedMovies()]);

  return (
    <section className="glass-panel relative overflow-hidden rounded-card border border-line p-6 shadow-2xl sm:p-8 md:p-10">
      {/* Soft Ambient Colorful Radial Glows */}
      <div className="pointer-events-none absolute top-0 right-1/4 h-96 w-96 rounded-pill bg-accent-bright/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-10 left-10 h-80 w-80 rounded-pill bg-info-soft blur-3xl" />

      <div className="relative z-10 grid grid-cols-1 items-center gap-8 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="apple-badge border border-line bg-surface-soft text-ink-secondary">
              <IconSparkles size={13} className="text-accent-ink" />
              <span>Your Entertainment Hub</span>
            </div>
          </div>

          <h2 className="text-3xl leading-[1.1] font-extrabold tracking-tight text-ink sm:text-4xl md:text-5xl">
            Track what you love, <br />
            <span className="bg-gradient-to-r from-accent-strong via-accent-tint to-secondary bg-clip-text text-transparent">
              effortlessly.
            </span>
          </h2>

          <p className="max-w-xl text-sm leading-relaxed font-normal text-ink-muted md:text-base">
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
