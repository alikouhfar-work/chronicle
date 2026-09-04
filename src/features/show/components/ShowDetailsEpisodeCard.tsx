import {
  IconCalendar,
  IconCalendarTime,
  IconCircle,
  IconCircleCheck,
  IconEdit,
  IconMessage,
  IconStar,
} from '@tabler/icons-react';
import { FC, useTransition } from 'react';
import { toggleEpisodeWatched } from '@/features/show/actions/toggleEpisodeWatched';
import { ShowDetailsEpisodeCardProps } from '@/features/show/types/showDetailsEpisodeCardProps';
import { format } from 'date-fns';

export const ShowDetailsEpisodeCard: FC<ShowDetailsEpisodeCardProps> = ({ showId, episode }) => {
  const isWatched = episode.tracking?.watched ?? false;
  const [isEpisodePending, startEpisodeTransition] = useTransition();

  const handleToggleEpisode = (episodeId: string) => {
    startEpisodeTransition(async () => {
      await toggleEpisodeWatched(showId, episodeId);
    });
  };

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
      {/* Status indicator */}
      {isUpcomingEpisode ? (
        <div className="flex shrink-0 items-center justify-center p-1">
          <IconCalendarTime size={20} className="text-violet-400" />
        </div>
      ) : (
        <button
          onClick={() => handleToggleEpisode(episode.id)}
          className={`mt-0.5 flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-full transition-transform duration-150 active:scale-90 ${
            isWatched
              ? 'bg-violet-500/15 text-violet-400'
              : 'bg-zinc-800 text-zinc-500 hover:text-zinc-300'
          }`}
          title={isWatched ? 'Mark as unwatched' : 'Mark as watched'}
        >
          {isEpisodePending ? (
            <span className="block size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          ) : isWatched ? (
            <IconCircleCheck size={20} className="fill-violet-400/20" />
          ) : (
            <IconCircle size={20} />
          )}
        </button>
      )}

      <div className="flex-1 space-y-1">
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
          className={`text-xs font-bold sm:text-sm ${isWatched ? 'text-zinc-400 line-through' : 'text-white'}`}
        >
          {episode.name}
        </h5>

        {episode.overview && (
          <p className="max-w-2xl text-xs leading-relaxed font-normal text-zinc-400">
            {episode.overview}
          </p>
        )}

        {isEpisodePending && (
          <div className="flex flex-wrap items-center gap-3 pt-1.5">
            {episode.tracking?.rating ? (
              <div className="flex items-center gap-1 rounded-full border border-amber-400/20 bg-amber-400/10 px-2.5 py-0.5 text-xs font-bold text-amber-400">
                <IconStar className="fill-amber-400 text-amber-400" size={11} />
                <span>{episode.tracking.rating} / 5</span>
              </div>
            ) : null}

            {episode.tracking?.notes ? (
              <p className="line-clamp-1 flex max-w-xl items-center gap-1.5 text-xs text-zinc-300 italic">
                <IconMessage size={12} className="shrink-0 text-violet-400" />
                <span>&#34;{episode.tracking.notes}&#34;</span>
              </p>
            ) : null}
          </div>
        )}
      </div>

      {/* Review button */}
      {isWatched && !isUpcomingEpisode && (
        <button className="apple-pill-btn flex shrink-0 cursor-pointer items-center gap-1.5 self-center rounded-full bg-white/6 px-3 py-1.5 text-xs text-zinc-300 hover:bg-white/12">
          <IconEdit size={11} />
        </button>
      )}
    </li>
  );
};
