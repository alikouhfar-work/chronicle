import { IconMovie } from '@tabler/icons-react';
import { FC } from 'react';
import { UpcomingMediaSection } from '@/components/upcoming/UpcomingMediaSection';
import { getUpcomingMovies } from '@/features/movie';
import { MappedUpcomingMovie } from '@/features/movie/types/upcomingMovie';

export const UpcomingMovieList: FC = async () => {
  const upcomingMovies = await getUpcomingMovies();

  return (
    <UpcomingMediaSection<MappedUpcomingMovie>
      icon={IconMovie}
      mediaType="movie"
      upcomingMedia={upcomingMovies}
      sectionTitle="Movie Premieres"
      sectionSubtitle="Theatrical releases & streaming debuts"
      emptySectionTitle="No Upcoming Movie Premieres"
      emptySectionSubtitle="Add movies to your library to track their theatrical and streaming premiere dates."
      getTitle={(media) => media.name}
    />
  );
};
