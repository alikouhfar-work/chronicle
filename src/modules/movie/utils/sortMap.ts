import { MediaSortFilter } from '@/modules/media/entities';

export const movieSortMap = {
  title: 'name',
  recent: 'createdAt',
  year: 'releaseDate',
} satisfies Record<MediaSortFilter, string>;
