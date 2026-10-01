import type { ComponentType } from 'react';

export type IconComponent = ComponentType<{
  size?: number | string;
  className?: string;
}>;
