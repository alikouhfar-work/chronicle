import { DashboardHeader } from '@/modules/dashboard/components/DashboardHeader';
import {
  TrendingMovieList,
  TrendingShowList,
  UpcomingEpisodeList,
  UpcomingMovieList,
} from '@/modules/dashboard';
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
