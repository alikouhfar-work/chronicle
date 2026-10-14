'use client';

import {
  IconAlertCircle,
  IconCheck,
  IconInfoCircle,
} from '@tabler/icons-react';
import { clsx } from 'clsx';

export type AppToastTone = 'success' | 'error' | 'info';

const toneStyles: Record<
  AppToastTone,
  { frame: string; chip: string; Icon: typeof IconCheck }
> = {
  success: {
    frame: 'border-emerald-500/30',
    chip: 'border-emerald-500/40 bg-emerald-500/20 text-emerald-400',
    Icon: IconCheck,
  },
  error: {
    frame: 'border-rose-500/30',
    chip: 'border-rose-500/40 bg-rose-500/20 text-rose-400',
    Icon: IconAlertCircle,
  },
  info: {
    frame: 'border-violet-500/30',
    chip: 'border-violet-500/40 bg-violet-500/20 text-violet-400',
    Icon: IconInfoCircle,
  },
};

export const AppToast = ({
  tone,
  title,
  message,
}: {
  id: string;
  tone: AppToastTone;
  title: string;
  message?: string;
}) => {
  const { frame, chip, Icon } = toneStyles[tone];

  return (
    <div
      className={clsx(
        'animate-fade-in flex w-[calc(100vw-2rem)] max-w-sm items-center gap-3 rounded-2xl border bg-zinc-950/95 p-4 font-sans shadow-2xl shadow-black/90 backdrop-blur-2xl',
        frame,
      )}
    >
      <span
        className={clsx(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-full border',
          chip,
        )}
      >
        <Icon size={20} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm leading-tight font-bold tracking-tight text-white">{title}</p>
        {message && <p className="mt-0.5 text-[11px] break-words text-zinc-400">{message}</p>}
      </div>
    </div>
  );
};
