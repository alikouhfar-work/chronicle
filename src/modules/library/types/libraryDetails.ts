import { SimilarShow, TrackedShow } from '@/modules/show';
import { Credits } from '@/modules/discovery/credit';
import { SimilarMovie, TrackedMovie } from '@/modules/movie';
import { MediaType } from '@/shared/types/media';
import type { CommentAuthor } from '@/modules/comments/types';
import type { InitialCommentPage } from '@/modules/comments/types/initialCommentPage';
import type { NoteView } from '@/modules/notes/types';

type LibraryShowDetailsBaseProps = {
  credits: Credits | null;
  viewer: CommentAuthor | null;
  /** Server-rendered first page of the public review feed. */
  initialReviews?: InitialCommentPage;
  /** Server-rendered first page of the viewer's private notes. */
  initialNotes?: NoteView[];
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
