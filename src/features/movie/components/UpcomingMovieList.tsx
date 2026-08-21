import { IconDeviceTv } from '@tabler/icons-react';
import { FC } from 'react';
import { UpcomingMediaSection } from '@/components/upcoming/UpcomingMediaSection';
import { getUpcomingMovies } from '@/features/movie';
import { MappedUpcomingMovie } from '@/features/movie/types/upcomingMovie';

export const UpcomingMovieList: FC = async () => {
  const upcomingMovies = await getUpcomingMovies();

  return (
    <UpcomingMediaSection<MappedUpcomingMovie>
      icon={IconDeviceTv}
      upcomingMedia={upcomingMovies}
      sectionTitle="Feature Films & Sequels"
      sectionSubtitle="Theatrical premieres and franchise sequels"
      emptySectionTitle="No Upcoming Movie Premieres Forecasted"
      emptySectionSubtitle="Add films and cinematic franchises to your archive to track future sequels and theatrical release dates."
      getTitle={(media) => media.name}
    />
  );
};
