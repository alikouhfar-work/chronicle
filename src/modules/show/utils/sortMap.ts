import { MediaSortFilter } from '@/modules/media/entities';

export const showSortMap = {
  title: 'name',
  recent: 'createdAt',
  year: 'firstAirDate',
} satisfies Record<MediaSortFilter, string>;
