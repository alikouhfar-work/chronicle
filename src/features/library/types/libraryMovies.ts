import { MediaSortFilter, MediaStatusFilter } from '@/features/library';

export type LibraryMoviesProps = {
  sort?: MediaSortFilter;
  status?: MediaStatusFilter;
};
