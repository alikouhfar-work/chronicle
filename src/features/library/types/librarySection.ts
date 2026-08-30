import { ForwardRefExoticComponent, RefAttributes } from 'react';
import { IconProps } from '@tabler/icons-react';
import { TrackedMedia } from '@/features/library/types/trackedMedia';
import { MediaType } from '@/types/media';

export type LibrarySectionProps = {
  emptyListTitle: string;
  emptyListSubtitle: string;
  mediaType: MediaType;
  media: TrackedMedia[];
  icon: ForwardRefExoticComponent<IconProps & RefAttributes<SVGSVGElement>>;
};
