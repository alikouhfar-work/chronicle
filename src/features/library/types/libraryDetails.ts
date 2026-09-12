import { SimilarShow } from '@/features/show';
import { Credits } from '@/features/credit';
import { TrackedMedia } from '@/features/library';
import { SimilarMovie } from '@/features/movie';

export type LibraryShowDetailsProps = {
  media: TrackedMedia;
  credits: Credits | null;
  similarMedia: SimilarShow[] | SimilarMovie[];
};
