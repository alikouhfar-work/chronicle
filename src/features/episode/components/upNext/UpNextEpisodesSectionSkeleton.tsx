import { UpNextEpisodeCardSkeleton } from '@/features/episode/components/upNext/UpNextEpisodeCardSkeleton';

export const UpNextEpisodesSectionSkeleton = () => {
  return (
    <div className="space-y-6">
      <div className="border-zinc-850 flex flex-col justify-between gap-4 border-b pb-4 md:flex-row md:items-center">
        <div className="space-y-1">
          <div className="bg-zinc-850 h-9 w-70 animate-pulse rounded-lg" />
          <div className="bg-zinc-850 h-4.75 w-120 animate-pulse rounded" />
        </div>
        <div className="bg-gold-500/30 h-7.25 w-33.75 animate-pulse rounded-lg md:self-center" />
      </div>

      <ul className="space-y-4">
        {[1, 2].map((i) => (
          <UpNextEpisodeCardSkeleton key={i} />
        ))}
      </ul>
    </div>
  );
};
