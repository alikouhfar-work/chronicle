import { MediaType } from '@/shared/types/media';
import { GenreRaw } from '@/modules/discovery/genre';

export type SearchResultCardProps = {
  id: number;
  name: string;
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
