import { FC } from 'react';
import { LibraryShowProgressProps } from '@/features/library/types/libraryShowProgress';
import { getShowProgress } from '@/features/show/utils/getShowProgress';

export const LibraryShowProgress: FC<LibraryShowProgressProps> = ({
  seasons,
  numberOfEpisodes,
}) => {
  const progress = getShowProgress(seasons, numberOfEpisodes);

  return (
    <div className="space-y-1 border-t border-zinc-900/30 pt-1">
      <div className="flex justify-between font-mono text-[8px] tracking-wider text-zinc-500 uppercase">
        <span>Progress</span>
        <span className="font-bold text-zinc-300">{progress}%</span>
      </div>
      <div className="h-1 w-full overflow-hidden rounded-full border border-zinc-900/40 bg-zinc-950/60">
        <div
          className="bg-gold-400 h-1 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
};
