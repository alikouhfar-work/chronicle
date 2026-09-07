import { Credits } from '@/features/credit';
import { SimilarShow } from '@/features/show';

export type LibraryItemFooterProps = {
  credits: Credits | null;
  similarMedia: SimilarShow[];
};
