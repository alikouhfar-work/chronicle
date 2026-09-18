import { SimilarShow, TrackedShow } from '@/features/show';
import { Credits } from '@/features/credit';
import { SimilarMovie, TrackedMovie } from '@/features/movie';
import { MediaType } from '@/types/media';

type LibraryShowDetailsBaseProps = {
  credits: Credits | null;
};

export type LibraryShowDetailsProps =
  | (LibraryShowDetailsBaseProps & {
      media: TrackedMovie;
      mediaType: Extract<MediaType, 'movie'>;
      similarMedia: SimilarMovie[];
    })
  | (LibraryShowDetailsBaseProps & {
      media: TrackedShow;
      mediaType: Extract<MediaType, 'tv'>;
      similarMedia: SimilarShow[];
    });
