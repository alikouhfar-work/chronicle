import { Credits } from '@/modules/discovery/credit';
import { SimilarShow } from '@/modules/show';
import { SimilarMovie } from '@/modules/movie';

export type LibraryDetailsFooterProps = {
  credits: Credits | null;
  similarMedia: SimilarShow[] | SimilarMovie[];
};
