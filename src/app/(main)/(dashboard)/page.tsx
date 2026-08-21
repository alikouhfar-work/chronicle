import { DashboardHeader } from '@/app/(main)/(dashboard)/_components/DashboardHeader';
import { TrendingShowList } from '@/features/show';
import { TrendingMovieList, UpcomingMovieList } from '@/features/movie';
import { UpcomingEpisodeList, UpNextEpisodesSection } from '@/features/episode';

const DashboardPage = async () => {
  return (
    <article className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-10 px-4 py-8 sm:px-6 lg:px-8">
      <DashboardHeader />
      <UpNextEpisodesSection />

      <section className="flex flex-col gap-12 pt-6">
        <TrendingShowList />
        <TrendingMovieList />
      </section>

      <section className="pt-8 font-sans">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-10">
          <UpcomingEpisodeList />
          <UpcomingMovieList />
        </div>
      </section>
    </article>
  );
};

export default DashboardPage;
