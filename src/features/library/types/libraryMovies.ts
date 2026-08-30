import { MediaSortFilter, MediaStatusFilter } from '@/features/library';

export type LibraryMoviesProps = {
  search?: string;
  sort?: MediaSortFilter;
  status?: MediaStatusFilter;
};
