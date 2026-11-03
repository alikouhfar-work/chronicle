import { MediaSortFilter } from '@/modules/media/types/media';

export const showSortMap = {
  title: 'name',
  recent: 'createdAt',
  year: 'firstAirDate',
} satisfies Record<MediaSortFilter, string>;
