import { LibraryMediaDetailsHeaderSkeleton } from '@/features/library/components/LibraryMediaDetailsHeaderSkeleton';
import { LibraryMediaDetailsSkeleton } from '@/features/library/components/LibraryShowDetailsSkeleton';
import { LibraryMediaCreditsSkeleton } from '@/features/library/components/LibraryMediaCreditsSkeleton';
import { LibraryMediaRecommendationsSkeleton } from '@/features/library/components/LibraryMediaRecommendationsSkeleton';

const LibraryItemPageLoading = () => {
  return (
    <article className="animate-fade-in mx-auto w-full max-w-5xl space-y-8 pb-12 font-sans select-none">
      <LibraryMediaDetailsHeaderSkeleton />
      <LibraryMediaDetailsSkeleton />
      <section className="grid grid-cols-1 gap-6 border-t border-white/8 pt-4 lg:grid-cols-3">
        <LibraryMediaCreditsSkeleton />
        <LibraryMediaRecommendationsSkeleton />
      </section>
    </article>
  );
};

export default LibraryItemPageLoading;
