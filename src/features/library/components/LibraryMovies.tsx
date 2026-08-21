import { IconMovie } from '@tabler/icons-react';
import { getTrackedMovies } from '@/features/movie';
import { LibrarySection } from '@/features/library/components/LibrarySection';
import { LibraryMoviesProps } from '@/features/library/types/libraryMovies';

export const LibraryMovies = async ({ sort, status }: LibraryMoviesProps) => {
  const movies = await getTrackedMovies(sort, status);

  return (
    <LibrarySection
      media={movies}
      icon={IconMovie}
      mediaType="movie"
      emptyMessage="No Movies found matching the current filter."
    />
  );
};
