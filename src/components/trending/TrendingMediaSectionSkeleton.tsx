import { TrendingMediaCardSkeleton } from '@/components/trending/TrendingMediaCardSkeleton';

export const TrendingMediaSectionSkeleton = () => {
  const trendingMedia = Array.from({ length: 5 }).map((_, i) => i);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-white/8 pb-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="h-3.5 w-3.5 animate-pulse rounded-full bg-violet-400/50" />
            <div className="h-6 w-44 animate-pulse rounded-lg bg-zinc-700" />
          </div>
          <div className="h-3.5 w-60 animate-pulse rounded-md bg-zinc-800" />
        </div>
        <div className="flex items-center gap-1.5 rounded-full border border-white/8 bg-white/4 p-1">
          <div className="h-6 w-6 animate-pulse rounded-full bg-white/6" />
          <div className="h-6 w-6 animate-pulse rounded-full bg-white/6" />
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
