import { MediaSortFilter } from '@/features/library';

export const movieSortMap = {
  title: 'name:asc',
  recent: 'createdAt:desc',
  year: 'releaseDate:desc',
} satisfies Record<MediaSortFilter, `${string}:${'asc' | 'desc'}`>;
