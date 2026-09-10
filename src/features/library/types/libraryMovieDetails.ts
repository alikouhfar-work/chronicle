import { TrackedMovie } from '@/features/movie';
import { Credits } from '@/features/credit';
import { SimilarMovie } from '@/features/movie/types/similarMovie';

export type LibraryMovieDetailsProps = {
  movie: TrackedMovie;
  credits: Credits | null;
  similarMovies: SimilarMovie[]
};
