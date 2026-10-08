import { DashboardHeader } from '@/modules/dashboard/components/DashboardHeader';
import { TrendingShowList } from '@/modules/show';
import { TrendingMovieList, UpcomingMovieList } from '@/modules/movie';
import { UpcomingEpisodeList } from '@/modules/episode-season/components/UpcomingEpisodeList';
import { UpNextEpisodesSection } from '@/modules/episode-season/components/upNext/UpNextEpisodesSection';

export const dynamic = 'force-dynamic';

const DashboardPage = async () => {
  return (
    <article className="animate-fade-in space-y-10 font-sans">
      <DashboardHeader />
      <UpNextEpisodesSection />

      <section className="space-y-8 pt-4">
        <TrendingShowList />
        <TrendingMovieList />
      </section>

      <section className="border-t border-white/8 pt-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <UpcomingEpisodeList />
          <UpcomingMovieList />
        </div>
      </section>
    </article>
  );
};

export default DashboardPage;
