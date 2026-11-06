import { UpcomingMediaCardSkeleton } from '@/modules/dashboard/components/upcoming/UpcomingMediaCardSkeleton';

export const UpcomingMediaSectionSkeleton = () => {
  const upcomingMedia = Array.from({ length: 4 }).map((_, i) => i);

  return (
    <div className="space-y-4">
      <div className="flex flex-col justify-between gap-2.5 border-b border-line pb-3 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 animate-pulse rounded-control border border-accent-line bg-accent-bright/15" />
          <div className="space-y-1">
            <div className="h-4 w-32 animate-pulse rounded-xs bg-surface-strong" />
            <div className="h-3 w-48 animate-pulse rounded-xs bg-surface-strong" />
          </div>
        </div>
        <div className="h-5 w-20 animate-pulse self-end rounded-pill bg-surface-soft" />
      </div>

      <ul className="space-y-2.5">
        {upcomingMedia.map((media) => (
          <UpcomingMediaCardSkeleton key={media} />
        ))}
      </ul>
    </div>
  );
};
