import { TrackedMovie } from '@/features/movie';

export type UpcomingMovie = Omit<TrackedMovie, 'genres'>;

export type MappedUpcomingMovie = {
  id: string;
  name: string;
  tmdbId: number;
  overview: string;
  airDate: Date | null;
  posterPath: string | null;
};
