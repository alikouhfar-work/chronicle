import { UpNextEpisodesSectionSkeleton } from '@/modules/episode-season';
import { DashboardHeaderSkeleton } from '@/modules/dashboard/components/DashboardHeaderSkeleton';
import { UpcomingMediaSectionSkeleton } from '@/shared/ui/upcoming/UpcomingMediaSectionSkeleton';
import { TrendingMediaSectionSkeleton } from '@/shared/ui/trending/TrendingMediaSectionSkeleton';

const DashboardPageLoading = () => {
  return (
    <article className="animate-fade-in space-y-10 font-sans">
      <DashboardHeaderSkeleton />
      <UpNextEpisodesSectionSkeleton />

      <section className="space-y-8 pt-4">
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
