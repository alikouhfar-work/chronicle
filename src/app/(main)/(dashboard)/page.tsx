import { DashboardHeader } from '@/app/(main)/(dashboard)/_components/DashboardHeader';
import { TrendingShowList } from '@/features/show';
import { TrendingMovieList, UpcomingMovieList } from '@/features/movie';
import { UpcomingEpisodeList } from '@/features/episode/components/UpcomingShowList';
import { UpNextEpisodesSection } from '@/features/episode/components/upNext/UpNextEpisodesSection';

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
