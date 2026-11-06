'use client';

import { IconCalendar, IconCalendarTime, IconStar } from '@tabler/icons-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { ShowDetailsEpisodeCardToggleButton } from '@/modules/episode-season/components/ShowDetailsEpisodeCardToggleButton';
import type { ShowDetailsEpisodeCardProps } from '@/modules/episode-season/types/showDetailsEpisodeCardProps';
import { RewatchHistoryButton } from '@/modules/rewatch';

/**
 * One episode row. The whole card is the click target for opening the episode
 * page, so it carries no duplicated "discussion" / "edit review" buttons —
 * only the actions that cannot be reached through the link (watch toggle,
 * rewatch history).
 */
export const ShowDetailsEpisodeCard = ({ episode, showTmdbId }: ShowDetailsEpisodeCardProps) => {
  const isWatched = episode.tracking?.watched ?? false;
  const isUpcomingEpisode = !episode.airDate || episode.airDate > new Date();

  return (
    <li
        className={`group/ep glass-card relative flex items-start gap-3.5 overflow-hidden rounded-card p-4 transition-all duration-150 hover:border-line-strong ${
          isUpcomingEpisode
            ? 'border-dashed border-accent-ink'
            : isWatched
              ? 'border-line bg-surface-sunken/40 opacity-80'
              : 'border-line'
        }`}
      >
        {isUpcomingEpisode && (
          <>
            <div className="pointer-events-none absolute top-0 right-1/2 h-80 w-3/5 rounded-pill bg-accent-bright/10 blur-3xl" />
            <div className="pointer-events-none absolute bottom-0 left-10 h-72 w-3/4 rounded-pill bg-info-soft blur-3xl" />
          </>
        )}
        {isUpcomingEpisode ? (
          <div className="flex shrink-0 items-center justify-center p-1">
            <IconCalendarTime size={20} className="text-accent-ink" />
          </div>
        ) : (
          <ShowDetailsEpisodeCardToggleButton
            key={`${episode.id}-${isWatched}-${episode.rewatchCount}`}
            episodeId={episode.id}
            episodeName={episode.name}
            episodeNumber={episode.episodeNumber}
            isWatched={isWatched}
            rewatchCount={episode.rewatchCount}
          />
        )}

        <Link
          href={`/library/tv/${showTmdbId}/episode/${episode.id}`}
          className="flex-1 space-y-1 rounded-control outline-offset-4 focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:outline-none"
          aria-label={`Open ${episode.name} details and discussion`}
        >
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-micro font-bold tracking-tight text-accent-ink uppercase">
              Episode {episode.episodeNumber}
            </span>
            {episode.airDate && (
              <span className="flex items-center gap-1 text-xs text-ink-muted">
                <IconCalendar size={11} className="text-ink-subtle" />{' '}
                {format(episode.airDate, 'yyyy.MM.dd - HH:mm')}
              </span>
            )}
          </div>

          <h5
            className={`text-xs font-bold transition-colors group-hover/ep:text-accent-ink sm:text-sm ${isWatched ? 'text-ink-muted line-through' : 'text-ink'}`}
          >
            {episode.name}
          </h5>

          {episode.overview && (
            <p className="max-w-2xl text-xs leading-relaxed font-normal text-ink-muted">
              {episode.overview}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-3 pt-1.5">
            {episode.tracking?.rating ? (
              <div className="flex items-center gap-1 rounded-pill border border-warning/30 bg-warning-soft px-2.5 py-0.5 text-xs font-bold text-rating">
                <IconStar className="fill-rating text-rating" size={11} />
                <span>{episode.tracking.rating} / 5</span>
              </div>
            ) : null}
          </div>
        </Link>

        {!isUpcomingEpisode && (
          <div className="flex shrink-0 items-center gap-1.5 self-center">
            <RewatchHistoryButton
              mediaType="episode"
              mediaId={episode.id}
              title={episode.name}
              count={episode.rewatchCount}
            />
          </div>
        )}
    </li>
  );
};
