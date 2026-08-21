import { getSampleMovies } from '@/api/getSampleMovies';
import { getSampleShows } from '@/api/getSampleShows';
import { Dashboard } from '@/features/dashboard';
import { getSampleUpcoming } from '@/api/getSampleUpcoming';
import { getSampleTrending } from '@/api/getSampleTrending';

const DashboardPage = async () => {
  const [sampleMovies, sampleShows, sampleTrending, sampleUpcoming] = await Promise.all([
    getSampleMovies(),
    getSampleShows(),
    getSampleTrending(),
    getSampleUpcoming(),
  ]);

  return (
      <Dashboard
        shows={sampleShows}
        movies={sampleMovies}
        trendingMedia={sampleTrending}
        upcomingEvents={sampleUpcoming}
      />
  );
};

export default DashboardPage;
