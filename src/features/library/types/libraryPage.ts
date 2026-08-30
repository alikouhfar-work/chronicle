import { MediaSortFilter, MediaStatusFilter, MediaTypeFilter } from '@/features/library';

export type LibraryPageProps = {
  searchParams: Promise<{
    search?: string;
    type?: MediaTypeFilter;
    sort?: MediaSortFilter;
    status?: MediaStatusFilter;
  }>;
};
