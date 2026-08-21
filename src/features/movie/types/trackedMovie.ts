import { Genre } from '@/features/genre';
import { Tracking } from '@/features/show/types/show';

export type TrackedMovie = {
  id: string;
  tmdbId: number;
  name: string;
  genres: Genre[];
  overview: string;
  releaseDate: Date | null;
  posterPath: string | null;
  backdropPath: string | null;
  posterDescription?: string;
  runtime: number;
  tagline?: string;
  tracking: Tracking | null;
};
