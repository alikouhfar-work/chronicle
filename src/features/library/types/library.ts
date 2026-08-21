import { TrackedMovie } from '@/features/movie';
import { TrackedShow } from '@/features/show';

export type LibraryProps = {
  shows: TrackedShow[];
  movies: TrackedMovie[];
};
