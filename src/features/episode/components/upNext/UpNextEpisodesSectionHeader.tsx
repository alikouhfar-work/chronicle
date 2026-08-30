import { IconPlayerPlay } from '@tabler/icons-react';
import { FC } from 'react';
import { UpNextEpisodesSectionHeaderProps } from '@/features/episode/types/upNextShowsSectionHeader';

export const UpNextEpisodesSectionHeader: FC<UpNextEpisodesSectionHeaderProps> = async ({
  upNextEpisodesCount,
}) => {
  return (
    <div className="flex flex-col justify-between gap-3 border-b border-white/8 pb-3 md:flex-row md:items-center">
      <div className="space-y-0.5">
        <h3 className="flex items-center space-x-2.5 text-xl font-bold tracking-tight text-white sm:text-2xl">
          <IconPlayerPlay className="fill-violet-400 text-violet-400" size={20} />
          <span>Continue Watching</span>
        </h3>
        <p className="text-xs font-normal text-zinc-400">
          Next episodes lined up and ready for your next viewing session.
        </p>
      </div>
      {upNextEpisodesCount > 0 && (
        <span className="apple-badge self-start border border-white/10 bg-white/6 text-zinc-300 md:self-center">
          {upNextEpisodesCount} In Progress
        </span>
      )}
    </div>
  );
};
