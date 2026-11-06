import type { ShowLifecycle } from '@/modules/show/types/showLifecycle';

export const showLifecycleConfig: Record<
  ShowLifecycle,
  { title: string; colors: string }
> = {
  continuing: {
    title: 'Continuing',
    colors: 'border-accent-line bg-accent-soft text-accent-ink',
  },
  ended: {
    title: 'Ended',
    colors: 'border-line bg-surface-soft text-ink-muted',
  },
};

/**
 * Maps the raw TMDB show status (synced onto the tracked show) to a small
 * lifecycle vocabulary. Tracking status (Completed, Watching, …) describes
 * the user's progress; this describes the show itself, so the two badges
 * never compete. Returns null for pre-air lifecycles (Planned, Pilot) and
 * anything unrecognized — callers fall back to the raw status text.
 */
export const getShowLifecycle = (
  status: string | null | undefined,
  inProduction: boolean,
): ShowLifecycle | null => {
  const normalized = (status ?? '').toLowerCase();
  if (normalized.includes('ended') || normalized.includes('cancel')) return 'ended';
  if (
    normalized.includes('returning') ||
    normalized.includes('in production') ||
    inProduction
  )
    return 'continuing';
  return null;
};
