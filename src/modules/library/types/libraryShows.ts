import { MediaSortFilter, MediaStatusFilter } from '@/modules/library';

export type LibraryShowsProps = {
  search?: string
  sort?: MediaSortFilter;
  status?: MediaStatusFilter;
};
