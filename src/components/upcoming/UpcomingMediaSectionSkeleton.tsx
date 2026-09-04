import { UpcomingMediaCardSkeleton } from '@/components/upcoming/UpcomingMediaCardSkeleton';

export const UpcomingMediaSectionSkeleton = () => {
  const upcomingMedia = Array.from({ length: 4 }).map((_, i) => i);

  return (
    <div className="space-y-4">
      <div className="flex flex-col justify-between gap-2.5 border-b border-white/8 pb-3 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 animate-pulse rounded-xl border border-violet-500/25 bg-violet-500/15" />
          <div className="space-y-1">
            <div className="h-4 w-32 animate-pulse rounded bg-zinc-700" />
            <div className="h-3 w-48 animate-pulse rounded bg-zinc-800" />
          </div>
        </div>
        <div className="h-5 w-20 animate-pulse self-end rounded-full bg-white/6" />
      </div>

      <ul className="space-y-2.5">
        {upcomingMedia.map((media) => (
          <UpcomingMediaCardSkeleton key={media} />
        ))}
      </ul>
    </div>
  );
};
