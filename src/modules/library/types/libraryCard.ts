import { TrackedMedia } from '@/modules/library/types/trackedMedia';
import { MediaType } from '@/shared/types/media';

export type LibraryCardProps = {
  media: TrackedMedia;
  mediaType: MediaType;
};
