import { getShowLifecycle, showLifecycleConfig } from '@/modules/show/lib/showLifecycle';
import type { ShowLifecycleBadgeProps } from '@/modules/library/types/showLifecycleBadge';
import { clsx } from 'clsx';

export const ShowLifecycleBadge = ({
  status,
  inProduction,
  className,
}: ShowLifecycleBadgeProps) => {
  const lifecycle = getShowLifecycle(status, inProduction);

  if (!lifecycle) {
    if (!status) return null;
    return (
      <span
        className={clsx(
          'apple-badge border border-white/10 bg-white/6 text-xs text-zinc-200',
          className,
        )}
      >
        {status}
      </span>
    );
  }

  const config = showLifecycleConfig[lifecycle];

  return (
    <span className={clsx(`apple-badge border text-xs ${config.colors}`, className)}>
      {config.title}
    </span>
  );
};
