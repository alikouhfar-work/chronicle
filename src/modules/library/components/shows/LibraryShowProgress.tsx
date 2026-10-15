import { clsx } from 'clsx';
import { LibraryShowProgressProps } from '@/modules/library/types/libraryShowProgress';
import { getShowProgress } from '@/modules/show/utils/getShowProgress';
import { getShowPosition } from '@/modules/show/utils/getShowPosition';

export const STATUS_HEADLINES = {
  PLAN_TO_WATCH: ['On hold ⏳', 'Back burner 🔥'],
  WATCHING: ['Binging 🍿', 'Obsessed 👁️👁️'],
  COMPLETED: ['Next season waiting ⏳'],
  DROPPED: ['Ghosted 👻', 'Dropped 🪦', 'Gave up 💔'],
} as const;

// COMPLETED + ended gets its own headline: the user finished a finished
// show, which is different from merely reaching the finale untracked.
export const COMPLETED_ENDED_HEADLINE = 'Conquered 🏆';

export type ShowStatusKey = keyof typeof STATUS_HEADLINES;

export const getStatusHeadline = (
  status: string | undefined,
  seed: number,
  isEnded: boolean,
): string | null => {
  const key = status?.toUpperCase() as ShowStatusKey | undefined;
  if (!key || !(key in STATUS_HEADLINES)) return null;

  // If completed and ended, return no headline from the lookup — the
  // component renders COMPLETED_ENDED_HEADLINE for that case instead.
  if (key === 'COMPLETED' && isEnded) return null;

  const lines = STATUS_HEADLINES[key];
  return lines[seed % lines.length];
};

export const LibraryShowProgress = ({
  seasons,
  numberOfEpisodes,
  lifecycle,
  trackingStatus,
}: LibraryShowProgressProps) => {
  const progress = getShowProgress(seasons, numberOfEpisodes);
  const { nextLabel, segments } = getShowPosition(seasons);
  const isEnded = lifecycle === 'ended';
  const normalizedStatus = trackingStatus?.toUpperCase();
  const isDropped = normalizedStatus === 'DROPPED';

  // Resolve the headline directly: a status headline wins, otherwise use
  // position info. COMPLETED + ended celebrates the completion instead of
  // showing nothing.
  const statusHeadline = getStatusHeadline(trackingStatus, progress, isEnded);

  const isCompletedEnded = normalizedStatus === 'COMPLETED' && isEnded;
  const headline: string = isCompletedEnded
    ? COMPLETED_ENDED_HEADLINE
    : (statusHeadline ??
      (nextLabel ? `Next up · ${nextLabel}` : isEnded ? 'Sweet finale 🏁' : 'All caught up & cozy'));
  const fill = isDropped ? 'bg-rose-500' : 'bg-indigo-400';

  return (
    <div className="space-y-1 border-t border-white/10 pt-1.5">
      <div className="flex justify-between text-xs font-medium text-zinc-400">
        <span className="font-bold text-zinc-200">{headline}</span>
        <span className={clsx('font-bold', isDropped ? 'text-rose-500' : 'text-indigo-400')}>
          {progress}%
        </span>
      </div>
      <div
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${headline}, ${progress} percent, show is ${isDropped ? 'dropped' : isEnded ? 'ended' : 'continuing'}`}
        className="flex h-1.5 w-full gap-0.5"
      >
        {segments.length > 0 ? (
          segments.map((segment) => (
            <div
              key={segment.seasonNumber}
              title={`Season ${segment.seasonNumber}`}
              className="h-full flex-1 overflow-hidden rounded-full bg-white/8"
            >
              <div
                className={clsx('h-full rounded-full transition-all duration-500', fill)}
                style={{ width: `${segment.watchedFraction * 100}%` }}
              />
            </div>
          ))
        ) : (
          <div className="h-full w-full overflow-hidden rounded-full bg-zinc-800/80">
            <div
              className={clsx('h-full rounded-full transition-all duration-500', fill)}
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
};
