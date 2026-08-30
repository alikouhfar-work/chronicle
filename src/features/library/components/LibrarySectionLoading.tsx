import { LibraryCardSkeleton } from '@/features/library/components/LibraryCardSkeleton';

export const LibrarySectionLoading = () => {
  const shows = Array.from({ length: 6 }).map((_, i) => i);

  return (
    <div className="animate-fade-in w-full space-y-6 font-sans select-none">
      <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
        {shows.map((show) => (
          <LibraryCardSkeleton key={show} />
        ))}
      </ul>
    </div>
  );
};
