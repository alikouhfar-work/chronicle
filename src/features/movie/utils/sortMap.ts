import { MediaSortFilter } from '@/features/library';

export const movieSortMap = {
  title: 'name',
  recent: 'createdAt',
  year: 'releaseDate',
} satisfies Record<MediaSortFilter, string>;
