import { IconMovie } from '@tabler/icons-react';
import { UpcomingMediaSection } from '@/shared/ui/upcoming/UpcomingMediaSection';
import { MappedUpcomingMovie } from '@/modules/movie/types/upcomingMovie';
import { getUpcomingMovies } from '@/modules/movie/queries/getUpcomingMovies';

export const UpcomingMovieList = async () => {
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
