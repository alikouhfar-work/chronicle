import type { MediaType } from '@/shared/types/media';

export type { MediaType };

export type MediaGenre = {
  id: number;
  name: string;
};

export type TrendingMediaBase = {
  backdropPath: string;
  id: number;
  name: string;
  overview: string;
  mediaType: MediaType;
  genres: MediaGenre[];
  releaseDate: string;
  rating: number;
  voteCount: number;
  isTracked: boolean;
};

export type SimilarMediaBase = {
  backdropPath: string;
  id: number;
  name: string;
  overview: string;
  mediaType: MediaType;
  genres: MediaGenre[];
  releaseDate: string;
  isTracked: boolean;
};

export type MediaSortFilter = 'recent' | 'title' | 'year';

export type MediaStatusFilter = 'all' | 'plan_to_watch' | 'watching' | 'completed' | 'dropped';
