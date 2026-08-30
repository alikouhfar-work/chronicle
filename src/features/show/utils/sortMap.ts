import { MediaSortFilter } from '@/features/library';

export const showSortMap = {
  title: 'name',
  recent: 'createdAt',
  year: 'firstAirDate',
} satisfies Record<MediaSortFilter, string>;
