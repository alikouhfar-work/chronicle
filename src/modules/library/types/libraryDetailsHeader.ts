import type { ReactNode } from 'react';
import { TrackedMedia } from '@/modules/library';

export type LibraryDetailsHeaderProps = {
  media: TrackedMedia;
  controls?: ReactNode;
};
