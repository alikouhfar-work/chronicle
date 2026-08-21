import { UpNextEpisodesSectionSkeleton } from '@/features/episode';
import { DashboardHeaderSkeleton } from '@/app/(main)/(dashboard)/_components/DashboardHeaderSkeleton';
import { UpcomingMediaSectionSkeleton } from '@/components/upcoming/UpcomingMediaSectionSkeleton';
import { TrendingMediaSectionSkeleton } from '@/components/trending/TrendingMediaSectionSkeleton';

const DashboardPageLoading = () => {
  return (
    <article className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-10 px-4 py-8 sm:px-6 lg:px-8">
      <DashboardHeaderSkeleton />
      <UpNextEpisodesSectionSkeleton />

      <section className="flex flex-col gap-12 pt-6">
        <TrendingMediaSectionSkeleton />
        <TrendingMediaSectionSkeleton />
      </section>

      <section className="pt-8 font-sans">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-10">
          <UpcomingMediaSectionSkeleton />
          <UpcomingMediaSectionSkeleton />
        </div>
      </section>
    </article>
  );
};

export default DashboardPageLoading;
