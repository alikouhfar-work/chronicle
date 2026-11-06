'use client';

import { useState } from 'react';
import { IconDeviceTv } from '@tabler/icons-react';
import { clsx } from 'clsx';
import type { LibraryDetailsSeasonsProps } from '@/modules/library/types/libraryDetailsSeasons';
import { ShowDetailsEpisodeCard } from '@/modules/episode-season';
import { LibraryDetailsSeasonActions } from '@/modules/library/components/details/LibraryDetailsSeasonActions';
import { describeSeasonRewatch } from '@/modules/rewatch/lib/seasonRewatch';

export const LibraryDetailsSeasons = ({ show }: LibraryDetailsSeasonsProps) => {
  // Track only the selected id so the season object is always derived from
  // the latest props — after a toggle + router.refresh() the watched flags
  // come back fresh and the action label flips immediately. (Storing the
  // whole season in state would keep serving the pre-toggle snapshot.)
  const [activeSeasonId, setActiveSeasonId] = useState(show.seasons[0]?.id);
  const activeSeason =
    show.seasons.find((season) => season.id === activeSeasonId) ?? show.seasons[0];

  // Mirror markSeasonWatched: only aired episodes count. Unaired episodes can
  // never be marked by the toggle, so including them would wedge the label
  // on "Mark Season Watched" forever for in-progress seasons.
  if (!activeSeason) return null;

  const airedEpisodes = activeSeason.episodes.filter(
    (episode) => episode.airDate && episode.airDate <= new Date(),
  );
  const isSeasonWatched =
    airedEpisodes.length > 0 && airedEpisodes.every((episode) => episode.tracking?.watched);
  const seasonRewatchProgress = describeSeasonRewatch(
    airedEpisodes.map((episode) => ({
      watched: episode.tracking?.watched ?? false,
      rewatchCount: episode.rewatchCount,
    })),
  );

  return (
    <div className="grid w-full min-w-0 grid-cols-1 gap-6 md:grid-cols-3 lg:grid-cols-4">
      <div className="min-w-0 shrink-0 space-y-3">
        <h4 className="text-xs font-bold tracking-tight text-ink-muted uppercase">Seasons</h4>
        <div className="flex max-w-full min-w-0 flex-row gap-2 overflow-x-auto pb-2 md:flex-col md:overflow-visible md:pb-0">
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
                onClick={() => setActiveSeasonId(season.id)}
                aria-current={activeSeasonId === season.id}
                className={`group/season relative flex items-center justify-between gap-2 rounded-card border px-4 py-3 text-left text-xs font-semibold whitespace-nowrap transition-all duration-150 not-disabled:cursor-pointer disabled:opacity-50 md:whitespace-normal ${
                  activeSeasonId === season.id
                    ? 'border-white bg-white font-bold text-canvas shadow-lg'
                    : 'glass-card text-ink-muted not-disabled:hover:border-line-strong not-disabled:hover:text-ink'
                }`}
              >
                <div className="flex items-center gap-2">
                  <IconDeviceTv
                    size={14}
                    className={activeSeasonId === season.id ? 'text-canvas' : 'text-accent-ink'}
                  />
                  <span>{season.name}</span>
                </div>

                <span
                  className={clsx(
                    'rounded-pill px-2 py-0.5 text-micro font-bold',
                    isUpcomingSeason
                      ? 'border-accent-ink bg-accent-strong/5 font-bold text-accent-ink/70'
                      : isCompleted
                        ? activeSeasonId === season.id
                          ? 'bg-black/20 text-canvas'
                          : 'border border-accent-line bg-accent-bright/20 text-accent-ink'
                        : activeSeasonId === season.id
                          ? 'bg-black/20 text-canvas'
                          : 'bg-surface-soft text-ink-muted',
                  )}
                >
                  {isUpcomingSeason ? 'Upcoming' : `${watchedEpisodes}/${totalEpisodes}`}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="min-w-0 space-y-3.5 md:col-span-2 lg:col-span-3">
        <div className="flex flex-col justify-between gap-2 border-b border-line pb-2 md:flex-row md:items-center">
          <h4 className="text-base font-bold text-ink">{activeSeason.name} Episodes</h4>
          <LibraryDetailsSeasonActions
            showId={show.id}
            seasonId={activeSeason.id}
            seasonName={activeSeason.name}
            seasonWatched={isSeasonWatched}
            seasonRewatchCount={activeSeason.rewatchCount}
            episodesBelowBaseline={seasonRewatchProgress.episodesBelowBaseline}
          />
        </div>

        <ul className="max-h-120 space-y-2 overflow-y-auto">
          {activeSeason.episodes.map((episode) => (
            <ShowDetailsEpisodeCard
              episode={episode}
              showTmdbId={show.tmdbId}
              key={`${activeSeason.id}-${episode.episodeNumber}`}
            />
          ))}
        </ul>
      </div>
    </div>
  );
};
