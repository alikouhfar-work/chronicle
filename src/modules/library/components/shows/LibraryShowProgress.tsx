import { clsx } from 'clsx';
import { LibraryShowProgressProps } from '@/modules/library/types/libraryShowProgress';
import { getShowProgress } from '@/modules/show/utils/getShowProgress';
import { getShowPosition } from '@/modules/show/utils/getShowPosition';

export const LibraryShowProgress = ({
  seasons,
  numberOfEpisodes,
  lifecycle,
}: LibraryShowProgressProps) => {
  const progress = getShowProgress(seasons, numberOfEpisodes);
  const { nextLabel, segments } = getShowPosition(seasons);
  // Position language carries the state (S2 E4 → Caught up → Ended) in the
  // shared Ended vocabulary of the details badge; the strip stays indigo —
  // the Completed color — in every case.
  const isEnded = lifecycle === 'ended';
  const headline = nextLabel ?? (isEnded ? 'Ended' : 'Caught up');
  const fill = 'bg-indigo-400';

  return (
    <div className="space-y-1 border-t border-white/10 pt-1.5">
      <div className="flex justify-between text-xs font-medium text-zinc-400">
        <span className="font-bold text-zinc-200">{headline}</span>
        <span className="font-bold text-indigo-400">{progress}%</span>
      </div>
      <div
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${headline}, ${progress} percent, show is ${isEnded ? 'ended' : 'continuing'}`}
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
