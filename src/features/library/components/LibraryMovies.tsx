import { IconMovie } from '@tabler/icons-react';
import { getTrackedMovies } from '@/features/movie';
import { LibrarySection } from '@/features/library/components/LibrarySection';
import { LibraryMoviesProps } from '@/features/library/types/libraryMovies';

export const LibraryMovies = async ({ sort, status, search }: LibraryMoviesProps) => {
  const movies = await getTrackedMovies(sort, status, search);

  return (
    <LibrarySection
      media={movies}
      icon={IconMovie}
      mediaType="movie"
      emptyListTitle="No Movies Added Yet"
      emptyListSubtitle="Search and add feature films in the Discover tab to log your movie watch history."
    />
  );
};
