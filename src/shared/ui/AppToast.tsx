'use client';

import {
  IconAlertCircle,
  IconCheck,
  IconInfoCircle,
} from '@tabler/icons-react';
import { clsx } from 'clsx';
import type { AppToastProps, AppToastTone } from '@/shared/types/appToast';

const toneStyles: Record<
  AppToastTone,
  { frame: string; chip: string; Icon: typeof IconCheck }
> = {
  success: {
    frame: 'border-success/30',
    chip: 'border-success/40 bg-success-soft text-success',
    Icon: IconCheck,
  },
  error: {
    frame: 'border-danger/30',
    chip: 'border-danger/30 bg-danger-soft text-danger',
    Icon: IconAlertCircle,
  },
  info: {
    frame: 'border-accent-line',
    chip: 'border-accent-line bg-accent-bright/20 text-accent-ink',
    Icon: IconInfoCircle,
  },
};

export const AppToast = ({ tone, title, message, action }: AppToastProps) => {
  const { frame, chip, Icon } = toneStyles[tone];

  return (
    <div
      className={clsx(
        'animate-fade-in flex w-[calc(100vw-2rem)] max-w-sm items-center gap-3 rounded-card border bg-surface-sunken/95 p-4 font-sans shadow-2xl shadow-black/90 backdrop-blur-2xl',
        frame,
      )}
    >
      <span
        className={clsx(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-pill border',
          chip,
        )}
      >
        <Icon size={20} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm leading-tight font-bold tracking-tight text-ink">{title}</p>
        {message && <p className="mt-0.5 text-micro break-words text-ink-muted">{message}</p>}
      </div>
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="apple-pill-btn shrink-0 cursor-pointer border border-line bg-surface-soft px-3 py-1.5 text-micro font-semibold text-ink transition-colors hover:bg-surface-soft-hover"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};
