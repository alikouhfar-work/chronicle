import { MediaSortFilter, MediaStatusFilter } from '@/modules/library';

export type LibraryMoviesProps = {
  search?: string;
  sort?: MediaSortFilter;
  status?: MediaStatusFilter;
};
