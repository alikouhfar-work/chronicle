import { LibraryShowProgressProps } from '@/modules/library/types/libraryShowProgress';
import { getShowProgress } from '@/modules/show/utils/getShowProgress';

export const LibraryShowProgress = ({
  seasons,
  numberOfEpisodes,
}: LibraryShowProgressProps) => {
  const progress = getShowProgress(seasons, numberOfEpisodes);

  return (
    <div className="space-y-1 border-t border-white/10 pt-1.5">
      <div className="flex justify-between text-xs font-medium text-zinc-400">
        <span>Progress</span>
        <span className="font-bold text-violet-400">{progress}%</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-800/80">
        <div
          className="h-full rounded-full bg-linear-to-r from-violet-500 to-indigo-400 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};
