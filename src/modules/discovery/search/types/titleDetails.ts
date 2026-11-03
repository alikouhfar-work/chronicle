import type { GenreRaw } from '@/modules/discovery/genre';
import type { MediaType } from '@/shared/types/media';
import type { Credits } from '@/modules/discovery/credit';
import type { SimilarMovie } from '@/modules/movie';
import type { SimilarShow } from '@/modules/show';

export type TitleDetails = {
  tmdbId: number;
  mediaType: MediaType;
  name: string;
  overview: string;
  tagline: string | null;
  posterPath: string | null;
  backdropPath: string | null;
  year: string;
  releaseLabel: string | null;
  genres: GenreRaw[];
  rating: number | null;
  status: string | null;
  runtimeLabel: string | null;
  seasonsLabel: string | null;
  networkLabel: string | null;
  languageLabel: string | null;
};

export type TitleDetailsParams = {
  mediaType: string;
  id: string;
};

export type TitleDetailsPageProps = {
  params: Promise<TitleDetailsParams>;
};

export type TitleDetailsViewProps = {
  details: TitleDetails;
  credits: Credits | null;
  similar: SimilarShow[] | SimilarMovie[];
  isTracked: boolean;
};
