import { Credits } from '@/features/credit';
import { SimilarShow } from '@/features/show';
import { SimilarMovie } from '@/features/movie';

export type LibraryItemFooterProps = {
  credits: Credits | null;
  similarMedia: SimilarShow[] | SimilarMovie[];
};
