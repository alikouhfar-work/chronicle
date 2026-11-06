import { clsx } from 'clsx';
import type { EmptyStateProps } from '@/shared/types/emptyState';

/**
 * The single empty-state surface: dashed card, accent icon tile, title, and a
 * one-line explanation. Every "nothing here yet" panel uses this so spacing and
 * typography stay identical across modules.
 */
export const EmptyState = ({
  icon: Icon,
  title,
  description,
  action,
  compact = false,
  className,
}: EmptyStateProps) => (
  <div
    className={clsx(
      'glass-card flex flex-col items-center justify-center rounded-card border border-dashed border-line text-center',
      compact ? 'gap-2 px-4 py-8' : 'gap-3 px-6 py-12',
      className,
    )}
  >
    <div
      aria-hidden
      className={clsx(
        'rounded-xs border border-accent-line bg-accent-soft text-accent-ink',
        compact ? 'p-2.5' : 'p-3.5',
      )}
    >
      <Icon size={compact ? 20 : 28} />
    </div>
    <div className="max-w-sm space-y-1">
      <p className={clsx('font-bold text-ink', compact ? 'text-xs' : 'text-sm')}>{title}</p>
      {description ? (
        <p className="text-xs leading-relaxed text-ink-muted">{description}</p>
      ) : null}
    </div>
    {action}
  </div>
);
