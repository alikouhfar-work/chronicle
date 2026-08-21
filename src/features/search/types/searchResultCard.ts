import { MediaType } from '@/types/media';
import { GenreRaw } from '@/features/genre';

export type SearchResultCardProps = {
  id: number;
  name: string;
  adult: boolean;
  posterPath: string;
  mediaType: MediaType;
  year: string;
  rating: number;
  originalLanguage?: string;
  countries?: string | null;
  genres: GenreRaw[];
  overview?: string;
  isTracked: boolean;
};
