import { MediaSortFilter } from '@/features/library';

export const showSortMap = {
  title: 'name:asc',
  recent: 'createdAt:desc',
  year: 'firstAirDate:desc',
} satisfies Record<MediaSortFilter, `${string}:${'asc' | 'desc'}`>;
