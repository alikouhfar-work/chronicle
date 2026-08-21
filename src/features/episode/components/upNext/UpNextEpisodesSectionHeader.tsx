import { IconPlayerPlay } from '@tabler/icons-react';
import { FC } from 'react';
import { UpNextEpisodesSectionHeaderProps } from '@/features/episode/types/upNextShowsSectionHeader';

export const UpNextEpisodesSectionHeader: FC<UpNextEpisodesSectionHeaderProps> = async ({
  upNextShowsLength,
}) => {
  return (
    <div className="border-zinc-850 flex flex-col justify-between gap-4 border-b pb-4 md:flex-row md:items-center">
      <div className="space-y-1">
        <h3 className="flex items-center space-x-3 font-serif text-2xl font-extrabold text-white md:text-3xl">
          <IconPlayerPlay className="text-gold-400 fill-gold-400 animate-pulse" size={20} />
          <span>Up Next to Watch</span>
        </h3>
        <p className="text-xs leading-relaxed font-normal text-zinc-500">
          Your next queued episodes based on your active watchlist. Keep your progress updated.
        </p>
      </div>
      {upNextShowsLength > 0 && (
        <span className="bg-gold-400/10 text-gold-400 border-gold-400/20 shrink-0 self-start rounded-lg border px-3.5 py-1.5 font-mono text-[10px] font-extrabold tracking-widest uppercase md:self-center">
          {upNextShowsLength} Series Active
        </span>
      )}
    </div>
  );
};
