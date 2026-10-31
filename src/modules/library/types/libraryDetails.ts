import { SimilarShow, TrackedShow } from '@/modules/show';
import { Credits } from '@/modules/discovery/credit';
import { SimilarMovie, TrackedMovie } from '@/modules/movie';
import { MediaType } from '@/shared/types/media';
import type { CommentAuthor } from '@/modules/comments/types';

type LibraryShowDetailsBaseProps = {
  credits: Credits | null;
  viewer: CommentAuthor | null;
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
