import type { SimilarShow } from '@/modules/show';
import type { SimilarMovie } from '@/modules/movie';

export type SimilarMediaCarouselProps = {
  similarMedia: SimilarShow[] | SimilarMovie[];
};
