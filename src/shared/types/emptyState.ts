import type { ReactNode } from 'react';
import type { IconComponent } from '@/shared/types/icon';

export type EmptyStateProps = {
  /** Tabler icon rendered in the accent tile. */
  icon: IconComponent;
  title: string;
  description?: string;
  /** Optional primary action rendered under the copy. */
  action?: ReactNode;
  /** Tighter padding for popovers and sidebars. */
  compact?: boolean;
  className?: string;
};
