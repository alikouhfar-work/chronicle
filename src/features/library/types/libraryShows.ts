import { MediaSortFilter, MediaStatusFilter } from '@/features/library';

export type LibraryShowsProps = {
  search?: string
  sort?: MediaSortFilter;
  status?: MediaStatusFilter;
};
