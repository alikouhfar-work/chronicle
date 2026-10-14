import type { ReactNode } from 'react';
import { TrackedMedia } from '@/modules/library';
import type { Credits } from '@/modules/discovery/credit';
import type { MediaType } from '@/shared/types/media';

export type LibraryDetailsHeaderProps = {
  media: TrackedMedia;
  mediaType: MediaType;
  credits: Credits | null;
  controls?: ReactNode;
};
