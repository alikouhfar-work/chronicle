import { IconCircleCheck, IconClock, IconDeviceTv, IconMovie } from '@tabler/icons-react';
import type { DashboardHeaderWatchStatsProps } from '@/modules/dashboard/types/dashboardHeader';
import { computeWatchStats } from '@/modules/dashboard/lib/watchStats';
import { formatMinutes } from '@/shared/lib/formatMinutes';

export const DashboardHeaderWatchStats = ({
  trackedShows,
  trackedMovies,
}: DashboardHeaderWatchStatsProps) => {
  const { totalShowMinutes, totalMovieMinutes, episodesCount, moviesCount, completionRatePercent } =
    computeWatchStats(trackedShows, trackedMovies);

  return (
    <div className="glass-card space-y-4 rounded-card border border-line p-6 shadow-2xl">
      <div className="flex items-center justify-between border-b border-line pb-3">
        <span className="flex items-center gap-2 text-xs font-semibold tracking-tight text-ink-secondary">
          <IconClock size={15} className="text-accent-ink" />
          <span>Watch Analytics</span>
        </span>
        <span className="apple-badge border border-accent-line bg-accent-bright/15 text-micro text-accent-ink">
          Synced
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-control border border-line bg-surface-soft p-3 transition-all hover:border-line">
          <span className="mb-1 flex items-center gap-1.5 text-micro font-medium text-ink-muted">
            <IconDeviceTv size={12} className="text-accent-ink" />
            Series Time
          </span>
          <p className="text-sm font-bold text-ink">{formatMinutes(totalShowMinutes)}</p>
        </div>

        <div className="rounded-control border border-line bg-surface-soft p-3 transition-all hover:border-line">
          <span className="mb-1 flex items-center gap-1.5 text-micro font-medium text-ink-muted">
            <IconMovie size={12} className="text-accent-ink" />
            Movie Time
          </span>
          <p className="text-sm font-bold text-ink">{formatMinutes(totalMovieMinutes)}</p>
        </div>

        <div className="rounded-control border border-line bg-surface-soft p-3 transition-all hover:border-line">
          <span className="mb-1 flex items-center gap-1.5 text-micro font-medium text-ink-muted">
            <IconCircleCheck size={12} className="text-info" />
            Episodes
          </span>
          <p className="text-sm font-bold text-ink">
            {episodesCount} <span className="text-xs font-normal text-ink-muted">watched</span>
          </p>
        </div>

        <div className="rounded-control border border-line bg-surface-soft p-3 transition-all hover:border-line">
          <span className="mb-1 flex items-center gap-1.5 text-micro font-medium text-ink-muted">
            <IconMovie size={12} className="text-info" />
            Films
          </span>
          <p className="text-sm font-bold text-ink">
            {moviesCount} <span className="text-xs font-normal text-ink-muted">logged</span>
          </p>
        </div>
      </div>

      <div className="border-t border-line pt-2">
        <div className="mb-1.5 flex items-center justify-between text-xs font-medium text-ink-muted">
          <span>Library Completion</span>
          <span className="font-bold text-accent-ink">{completionRatePercent}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-pill bg-surface-strong/80">
          <div
            className="h-full rounded-pill bg-linear-to-r from-accent-strong to-secondary shadow-sm transition-all duration-500"
            style={{ width: `${completionRatePercent}%` }}
          />
        </div>
      </div>
    </div>
  );
};
