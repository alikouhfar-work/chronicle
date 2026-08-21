import { MovieStatus } from '@/app/types';

export type TrackedMovie = {
  id: string;
  title: string;
  year: number;
  genres: string[];
  synopsis: string;
  posterDescription?: string;
  runtime: number; // in minutes
  tagline?: string;
  trackedStatus: MovieStatus;
  watchedAt?: string;
  rating?: number; // 1-5
  notes?: string;
  addedAt: string;
  updatedAt: string;
};
