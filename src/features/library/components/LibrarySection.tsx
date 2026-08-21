import { LibraryCardSkeleton } from '@/features/library/components/LibraryCardSkeleton';

export const LibrarySectionLoading = () => {
  const shows = Array.from({ length: 6 }).map((_, i) => i);

  return (
    <div className="space-y-5">
      <div className="border-zinc-850/80 flex items-center justify-between border-b pb-3">
        <div className="flex items-center gap-3">
          <div className="size-9 animate-pulse rounded-xl bg-zinc-700 duration-1000" />
          <div className="h-8 w-36 animate-pulse rounded-xl bg-zinc-700 duration-1000" />
        </div>
      </div>

      <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {shows.map((show) => (
          <LibraryCardSkeleton key={show} />
        ))}
      </ul>
    </div>
  );
};
