import { SimilarShow, TrackedShow } from '@/features/show';
import { Credits } from '@/features/credit';

export type LibraryShowDetailsProps = {
  show: TrackedShow;
  credits: Credits | null;
  similarShows: SimilarShow[];
};
