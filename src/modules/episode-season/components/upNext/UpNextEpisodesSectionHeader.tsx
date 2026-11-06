import { IconPlayerPlay } from '@tabler/icons-react';
import type { UpNextEpisodesSectionHeaderProps } from '@/modules/episode-season/types/upNextShowsSectionHeader';

export const UpNextEpisodesSectionHeader = ({
  upNextEpisodesCount,
}: UpNextEpisodesSectionHeaderProps) => {
  return (
    <div className="flex flex-col justify-between gap-3 border-b border-line pb-3 md:flex-row md:items-center">
      <div className="space-y-0.5">
        <h3 className="flex items-center space-x-2.5 text-xl font-bold tracking-tight text-ink sm:text-2xl">
          <IconPlayerPlay className="fill-accent-strong text-accent-ink" size={20} />
          <span>Continue Watching</span>
        </h3>
        <p className="text-xs font-normal text-ink-muted">
          Next episodes lined up and ready for your next viewing session.
        </p>
      </div>
      {upNextEpisodesCount > 0 && (
        <span className="apple-badge self-start border border-line bg-surface-soft text-ink-secondary md:self-center">
          {upNextEpisodesCount} In Progress
        </span>
      )}
    </div>
  );
};
