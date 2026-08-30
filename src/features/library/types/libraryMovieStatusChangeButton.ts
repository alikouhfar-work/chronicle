import { MovieTrackingStatus } from '../../../../generated/prisma/enums';
import { MovieStatusFilter } from '@/features/movie/types/movieStatusFilter';

export type LibraryMovieStatusChangeButtonProps = {
  movieId: string;
  statusFilter: MovieStatusFilter;
  movieStatus?: MovieTrackingStatus;
};
