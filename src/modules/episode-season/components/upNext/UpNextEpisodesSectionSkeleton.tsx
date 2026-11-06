import { UpNextEpisodeCardSkeleton } from '@/modules/episode-season/components/upNext/UpNextEpisodeCardSkeleton';

export const UpNextEpisodesSectionSkeleton = () => {
  return (
    <section className="space-y-4">
      <div className="flex flex-col justify-between gap-3 border-b border-line pb-3 md:flex-row md:items-center">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="h-3.5 w-3.5 animate-pulse rounded-pill bg-accent-strong/50" />
            <div className="h-6 w-48 animate-pulse rounded-xs bg-surface-strong" />
          </div>
          <div className="h-3.5 w-64 animate-pulse rounded-xs bg-surface-strong" />
        </div>
        <div className="h-6 w-24 shrink-0 animate-pulse self-start rounded-pill border border-line bg-surface-soft md:self-center" />
      </div>

      <ul className="space-y-3">
        {[1, 2].map((i) => (
          <UpNextEpisodeCardSkeleton key={i} />
        ))}
      </ul>
    </section>
  );
};
