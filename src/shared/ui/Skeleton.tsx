import { clsx } from 'clsx';
import type { SkeletonProps } from '@/shared/types/skeleton';

export const Skeleton = ({ className, children }: SkeletonProps) => {
  return (
    <div aria-hidden="true" className={clsx('animate-pulse rounded-md bg-zinc-800', className)}>
      {children}
    </div>
  );
};
