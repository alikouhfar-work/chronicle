import { TrackedMovie } from '@/features/movie';
import { Credits } from '@/features/credit';

export type LibraryMovieDetailsProps = {
  movie: TrackedMovie;
  credits: Credits | null;
};
