import type { MediaType } from '@/shared/types/media';

export type TmdbListItemRaw = {
  id: number;
  backdrop_path: string;
  overview: string;
  genre_ids: number[];
  vote_average: number;
  vote_count: number;
  media_type?: MediaType;
  title?: string;
  name?: string;
  release_date?: string;
  first_air_date?: string;
};
