import { MediaSortFilter, MediaStatusFilter, MediaTypeFilter } from '@/modules/library';

export type LibraryPageProps = {
  searchParams: Promise<{
    search?: string;
    type?: MediaTypeFilter;
    sort?: MediaSortFilter;
    status?: MediaStatusFilter;
  }>;
};
