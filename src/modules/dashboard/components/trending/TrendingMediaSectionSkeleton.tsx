import { TrendingMediaCardSkeleton } from '@/modules/dashboard/components/trending/TrendingMediaCardSkeleton';

export const TrendingMediaSectionSkeleton = () => {
  const trendingMedia = Array.from({ length: 5 }).map((_, i) => i);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-line pb-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="h-3.5 w-3.5 animate-pulse rounded-pill bg-accent-strong/50" />
            <div className="h-6 w-44 animate-pulse rounded-xs bg-surface-strong" />
          </div>
          <div className="h-3.5 w-60 animate-pulse rounded-xs bg-surface-strong" />
        </div>
      </div>

      <ul className="flex gap-5 overflow-hidden pt-1 pb-4">
        {trendingMedia.map((media) => (
          <TrendingMediaCardSkeleton key={media} />
        ))}
      </ul>
    </div>
  );
};
