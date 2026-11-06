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
        className={`group/ep glass-card relative flex items-start gap-3.5 overflow-hidden rounded-2xl p-4 transition-all duration-150 hover:border-white/20 ${
          isUpcomingEpisode
            ? 'border-dashed border-violet-400/10'
            : isWatched
              ? 'border-white/4 bg-zinc-950/40 opacity-80'
              : 'border-white/8'
        }`}
      >
        {isUpcomingEpisode && (
          <>
            <div className="pointer-events-none absolute top-0 right-1/2 h-80 w-3/5 rounded-full bg-violet-500/10 blur-3xl" />
            <div className="pointer-events-none absolute bottom-0 left-10 h-72 w-3/4 rounded-full bg-indigo-500/10 blur-3xl" />
          </>
        )}
        {isUpcomingEpisode ? (
          <div className="flex shrink-0 items-center justify-center p-1">
            <IconCalendarTime size={20} className="text-violet-400" />
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
          className="flex-1 space-y-1 rounded-xl outline-offset-4 focus-visible:ring-2 focus-visible:ring-violet-400/60 focus-visible:outline-none"
          aria-label={`Open ${episode.name} details and discussion`}
        >
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-bold tracking-tight text-violet-400 uppercase">
              Episode {episode.episodeNumber}
            </span>
            {episode.airDate && (
              <span className="flex items-center gap-1 text-xs text-zinc-400">
                <IconCalendar size={11} className="text-zinc-500" />{' '}
                {format(episode.airDate, 'yyyy.MM.dd - HH:mm')}
              </span>
            )}
          </div>

          <h5
            className={`text-xs font-bold transition-colors group-hover/ep:text-violet-300 sm:text-sm ${isWatched ? 'text-zinc-400 line-through' : 'text-white'}`}
          >
            {episode.name}
          </h5>

          {episode.overview && (
            <p className="max-w-2xl text-xs leading-relaxed font-normal text-zinc-400">
              {episode.overview}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-3 pt-1.5">
            {episode.tracking?.rating ? (
              <div className="flex items-center gap-1 rounded-full border border-amber-400/20 bg-amber-400/10 px-2.5 py-0.5 text-xs font-bold text-amber-400">
                <IconStar className="fill-amber-400 text-amber-400" size={11} />
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
