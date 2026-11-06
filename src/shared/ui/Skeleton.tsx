import { clsx } from 'clsx';
import type { SkeletonProps } from '@/shared/types/skeleton';

export const Skeleton = ({ className, children }: SkeletonProps) => {
  return (
    <div aria-hidden="true" className={clsx('animate-pulse rounded-xs bg-surface-raised', className)}>
      {children}
    </div>
  );
};
