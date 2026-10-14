export type ShowLifecycle = 'continuing' | 'ended';

export const showLifecycleConfig: Record<
  ShowLifecycle,
  { title: string; colors: string }
> = {
  continuing: {
    title: 'Continuing',
    colors: 'border-violet-500/25 bg-violet-500/15 text-violet-300',
  },
  ended: {
    title: 'Ended',
    colors: 'border-white/10 bg-white/6 text-zinc-400',
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
