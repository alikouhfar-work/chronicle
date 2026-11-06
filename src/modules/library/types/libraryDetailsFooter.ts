import type { Credits } from '@/modules/discovery/credit';
import type { SimilarShow } from '@/modules/show';
import type { SimilarMovie } from '@/modules/movie';

export type LibraryDetailsFooterProps = {
  credits: Credits | null;
  similarMedia: SimilarShow[] | SimilarMovie[];
};
