import { Genre, GenreRaw } from '@/features/genre';
import { MovieTrackingStatus } from '../../../../generated/prisma/enums';

type MovieTracking = {
  id: string;
  notes?: string | null;
  rating?: number | null;
  status: MovieTrackingStatus;
  addedAt: Date;
  startedAt: Date | null;
};

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
  tagline?: string | null;
  tracking: MovieTracking | null;
};

export type TrackedMovieDetailsRaw = {
  backdrop_path: string;
  genres: GenreRaw[];
  id: number;
  overview: string;
  poster_path: string;
  release_date: string;
  runtime: number;
  status: string;
  tagline: string;
  title: string;
};
