import { TrendingMediaCardSkeleton } from '@/components/trending/TrendingMediaCardSkeleton';

export const TrendingMediaSectionSkeleton = () => {
  const trendingMedia = Array.from({ length: 5 }).map((_, i) => i);

  return (
    <div className="space-y-4">
      <div className="border-zinc-850 flex flex-col justify-between gap-4 border-b pb-4 md:flex-row md:items-center">
        <div className="w-full space-y-1">
          <div className="bg-zinc-850 h-9 w-1/4 animate-pulse rounded" />
          <div className="bg-zinc-850 h-4.75 w-1/2 animate-pulse rounded" />
        </div>
      </div>

      <ul className="flex gap-4 overflow-x-hidden pb-2">
        {trendingMedia.map((media) => (
          <TrendingMediaCardSkeleton key={media} />
        ))}
      </ul>
    </div>
  );
};
