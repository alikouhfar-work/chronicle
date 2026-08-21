import { MediaSortFilter } from '@/features/library';

export const showSortMap = {
  title: 'name:asc',
  year: 'firstAirDate:asc',
  recent: 'createdAt:asc',
} satisfies Record<MediaSortFilter, `${string}:asc`>;
