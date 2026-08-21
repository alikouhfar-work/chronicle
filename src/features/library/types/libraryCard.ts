import { TrackedMedia } from '@/features/library/types/trackedMedia';
import { MediaType } from '@/types/media';

export type LibraryCardProps = {
  media: TrackedMedia;
  mediaType: MediaType;
};
