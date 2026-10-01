import { IconMovie } from '@tabler/icons-react';
import { LibraryMediaSection } from '@/modules/library/components/LibraryMediaSection';
import { LibraryMoviesProps } from '@/modules/library/types/libraryMovies';
import { getTrackedMovies } from '@/modules/movie/queries/getTrackedMovies';

export const LibraryMovies = async ({ sort, status, search }: LibraryMoviesProps) => {
  const movies = await getTrackedMovies(sort, status, search);

  return (
    <LibraryMediaSection
      media={movies}
      icon={IconMovie}
      mediaType="movie"
      emptyListTitle="No Movies Added Yet"
      emptyListSubtitle="Search and add feature films in the Discover tab to log your movie watch history."
    />
  );
};
