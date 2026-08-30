import { UpNextEpisodeCardSkeleton } from '@/features/episode/components/upNext/UpNextEpisodeCardSkeleton';

export const UpNextEpisodesSectionSkeleton = () => {
  return (
    <section className="space-y-4">
      <div className="flex flex-col justify-between gap-3 border-b border-white/8 pb-3 md:flex-row md:items-center">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="h-3.5 w-3.5 animate-pulse rounded-full bg-violet-400/50" />
            <div className="h-6 w-48 animate-pulse rounded-lg bg-zinc-700" />
          </div>
          <div className="h-3.5 w-64 animate-pulse rounded-md bg-zinc-800" />
        </div>
        <div className="h-6 w-24 shrink-0 animate-pulse self-start rounded-full border border-white/10 bg-white/6 md:self-center" />
      </div>

      <ul className="space-y-3">
        {[1, 2].map((i) => (
          <UpNextEpisodeCardSkeleton key={i} />
        ))}
      </ul>
    </section>
  );
};
