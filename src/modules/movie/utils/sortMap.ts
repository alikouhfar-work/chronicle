import type { MediaSortFilter } from '@/modules/media/types/media';

export const movieSortMap = {
  title: 'name',
  recent: 'createdAt',
  year: 'releaseDate',
} satisfies Record<MediaSortFilter, string>;
