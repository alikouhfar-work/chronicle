import type { ReactNode } from 'react';
import type { IconComponent } from '@/shared/types/icon';
import type { TrackedMedia } from '@/modules/library/types/trackedMedia';
import type { MediaType } from '@/shared/types/media';

export type LibraryMediaSectionProps = {
  emptyListTitle: string;
  emptyListSubtitle: string;
  mediaType: MediaType;
  media: TrackedMedia[];
  icon: IconComponent;
  children?: ReactNode;
};
