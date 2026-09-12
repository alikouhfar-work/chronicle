import {
  LibraryDetailsCastSkeleton,
  LibraryDetailsHeaderSkeleton,
  LibraryDetailsSimilarMediaSkeleton,
  LibraryDetailsSkeleton,
} from '@/features/library';

const LibraryDetailsPageLoading = () => {
  return (
    <article className="animate-fade-in mx-auto w-full max-w-5xl space-y-8 pb-12 font-sans select-none">
      <LibraryDetailsHeaderSkeleton />
      <LibraryDetailsSkeleton />
      <section className="grid grid-cols-1 gap-6 border-t border-white/8 pt-4 lg:grid-cols-3">
        <LibraryDetailsCastSkeleton />
        <LibraryDetailsSimilarMediaSkeleton />
      </section>
    </article>
  );
};

export default LibraryDetailsPageLoading;
