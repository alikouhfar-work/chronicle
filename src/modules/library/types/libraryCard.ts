import type { TrackedMedia } from '@/modules/library/types/trackedMedia';
import type { MediaType } from '@/shared/types/media';

export type LibraryCardProps = {
  media: TrackedMedia;
  mediaType: MediaType;
};
