import { TrackedMovie } from '@/features/movie';
import { TrackedShow } from '@/features/show';

type LibraryMovieItemProps = {
  movie: TrackedMovie;
  moviesList: TrackedMovie[];
  similarMovies: TrackedMovie[];
};

type LibraryShowItemProps = {
  show: TrackedShow;
  showsList: TrackedShow[];
  similarShows: TrackedMovie[];
};

type LibraryItemBaseProps = {
  cast: any[];
};

export type LibraryItemProps = LibraryItemBaseProps &
  (LibraryMovieItemProps | LibraryShowItemProps);
