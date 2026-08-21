import { UpcomingMediaCardSkeleton } from '@/components/upcoming/UpcomingMediaCardSkeleton';

export const UpcomingMediaSectionSkeleton = () => {
  const upcomingMedia = Array.from({ length: 4 }).map((_, i) => i);

  return (
    <div className="space-y-4">
      <div className="border-zinc-850 flex items-center justify-between border-b pb-3">
        <div className="flex flex-1 items-center gap-2.5">
          <div className="bg-gold-400/10 border-gold-400/20 text-gold-400 size-9 animate-pulse rounded-lg border" />
          <div className="h-full w-full space-y-1">
            <div className="bg-zinc-850 h-6 w-1/3 animate-pulse rounded" />
            <div className="bg-zinc-850 h-4 w-2/3 animate-pulse rounded" />
          </div>
        </div>
        <div className="text-gold-400 bg-gold-400/10 border-gold-400/25 h-5.25 w-20.5 animate-pulse rounded-full border" />
      </div>

      <ul>
        {upcomingMedia.map((media) => (
          <UpcomingMediaCardSkeleton
            key={media}
            isFirst={media === 0}
            isLast={media === upcomingMedia.length - 1}
          />
        ))}
      </ul>
    </div>
  );
};
