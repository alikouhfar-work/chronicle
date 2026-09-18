'use client';

import { FC, useState } from 'react';
import { IconDeviceTv } from '@tabler/icons-react';
import { clsx } from 'clsx';
import { LibraryDetailsSeasonsProps } from '@/features/library/types/libraryDetailsSeasons';
import { ShowDetailsEpisodeCard } from '@/features/episode';
import { LibraryDetailsSeasonActions } from '@/features/library/components/details/LibraryDetailsSeasonActions';

export const LibraryDetailsSeasons: FC<LibraryDetailsSeasonsProps> = ({ show }) => {
  const [activeSeason, setActiveSeason] = useState(show.seasons[0]);

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:grid-cols-4">
      <div className="shrink-0 space-y-3">
        <h4 className="text-xs font-bold tracking-tight text-zinc-400 uppercase">Seasons</h4>
        <div className="flex flex-row gap-2 overflow-x-auto pb-2 md:flex-col md:overflow-visible md:pb-0">
          {show.seasons.map((season) => {
            const totalEpisodes = season.episodeCount;
            const watchedEpisodes = season.episodes.filter(
              (episode) => episode.tracking?.watched,
            ).length;

            const isUpcomingSeason = !season.airDate || season.airDate > new Date();
            const isCompleted = totalEpisodes > 0 && watchedEpisodes === totalEpisodes;

            return (
              <button
                key={season.id}
                disabled={isUpcomingSeason}
                onClick={() => setActiveSeason(season)}
                className={`group/season relative flex items-center justify-between gap-2 rounded-2xl border px-4 py-3 text-left text-xs font-semibold whitespace-nowrap transition-all duration-150 not-disabled:cursor-pointer disabled:opacity-50 md:whitespace-normal ${
                  activeSeason.id === season.id
                    ? 'border-white bg-white font-bold text-zinc-950 shadow-lg'
                    : 'glass-card text-zinc-400 not-disabled:hover:border-white/20 not-disabled:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <IconDeviceTv
                    size={14}
                    className={activeSeason.id === season.id ? 'text-zinc-950' : 'text-violet-400'}
                  />
                  <span>{season.name}</span>
                </div>

                <span
                  className={clsx(
                    'rounded-full px-2 py-0.5 text-[10px] font-bold',
                    isUpcomingSeason
                      ? 'border-violet-400/10 bg-violet-400/5 font-bold text-violet-400/70'
                      : isCompleted
                        ? activeSeason.id === season.id
                          ? 'bg-black/20 text-zinc-950'
                          : 'border border-violet-500/30 bg-violet-500/20 text-violet-300'
                        : activeSeason.id === season.id
                          ? 'bg-black/20 text-zinc-950'
                          : 'bg-white/6 text-zinc-400',
                  )}
                >
                  {isUpcomingSeason ? 'Upcoming' : `${watchedEpisodes}/${totalEpisodes}`}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-3.5 md:col-span-2 lg:col-span-3">
        <div className="flex flex-col justify-between gap-2 border-b border-white/8 pb-2 md:flex-row md:items-center">
          <h4 className="text-base font-bold text-white">{activeSeason.name} Episodes</h4>
          <LibraryDetailsSeasonActions
            showId={show.id}
            seasonId={activeSeason.id}
            seriesWatched={show.tracking?.status === 'COMPLETED'}
          />
        </div>

        <ul className="max-h-120 space-y-2 overflow-y-auto">
          {show.seasons
            .find((s) => s.id === activeSeason.id)
            ?.episodes.map((episode) => (
              <ShowDetailsEpisodeCard
                showId={show.id}
                episode={episode}
                key={`${activeSeason.id}-${episode.episodeNumber}`}
              />
            ))}
        </ul>
      </div>
    </div>
  );
};
