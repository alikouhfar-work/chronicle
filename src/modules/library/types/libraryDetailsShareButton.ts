import type { Credits } from '@/modules/discovery/credit';
import type { TrackedMedia } from '@/modules/library/types/trackedMedia';
import type { MediaType } from '@/shared/types/media';

export type LibraryDetailsShareButtonProps = {
  media: TrackedMedia;
  mediaType: MediaType;
  credits: Credits | null;
};
