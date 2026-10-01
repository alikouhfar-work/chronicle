import { MovieTrackingStatus } from '../../../../generated/prisma/enums';
import { MovieStatusFilter } from '@/modules/movie/types/movieStatusFilter';

export type LibraryMovieStatusChangeButtonProps = {
  movieId: string;
  statusFilter: MovieStatusFilter;
  movieStatus?: MovieTrackingStatus;
};
