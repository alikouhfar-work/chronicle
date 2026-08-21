import { MediaSortFilter, MediaStatusFilter, MediaTypeFilter } from '@/features/library';

export type LibraryPageProps = {
  searchParams: Promise<{
    type?: MediaTypeFilter;
    status?: MediaStatusFilter;
    sort?: MediaSortFilter;
  }>;
};
