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

export const ShowDetailsEpisodeCard: FC<ShowDetailsEpisodeCardProps> = ({
  showId,
  episode,
  isWatched,
}) => {
  const [isEpisodePending, startEpisodeTransition] = useTransition();

  const handleToggleEpisode = (episodeId: string) => {
    startEpisodeTransition(async () => {
      await toggleEpisodeWatched(showId, episodeId);
    });
  };

  const isUpcomingEpisode = !episode.airDate || episode.airDate > new Date();

  return (
    <li
      className={`group/ep flex items-start gap-4 rounded-2xl border p-4 transition-all duration-300 ${
        isUpcomingEpisode
          ? 'border-gold-400/10 from-gold-400/10 bg-linear-to-r via-zinc-900/40 to-zinc-900/20'
          : `bg-zinc-900/30 hover:bg-zinc-900/60 ${
              isWatched ? 'border-zinc-850/80 bg-zinc-900/15' : 'border-zinc-800/80'
            }`
      }`}
    >
      {/* Status indicator */}
      {isUpcomingEpisode ? (
        <div className="flex shrink-0 items-center justify-center p-1">
          <IconCalendarTime size={20} className="text-gold-400" />
        </div>
      ) : (
        <button
          disabled={isEpisodePending}
          onClick={() => handleToggleEpisode(episode.id)}
          className={`mt-0.5 shrink-0 cursor-pointer rounded-full p-1 transition-all duration-200 active:scale-90 ${
            isEpisodePending
              ? 'cursor-wait opacity-50'
              : isWatched
                ? 'text-gold-400'
                : 'text-zinc-600 hover:text-zinc-400'
          }`}
          title={isWatched ? 'Mark unwatched' : 'Mark watched'}
        >
          {isEpisodePending ? (
            <span className="block size-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
          ) : isWatched ? (
            <IconCircleCheck size={20} />
          ) : (
            <IconCircle size={20} />
          )}
        </button>
      )}

      {/* Episode details */}
      <div className="flex-1 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-[9px] font-bold tracking-wider text-zinc-500 uppercase">
            Episode {episode.episodeNumber}
          </span>

          {episode.airDate && (
            <span className="flex items-center gap-1 font-mono text-[9px] text-zinc-500">
              <IconCalendar size={10} className="text-gold-400" />
              {format(episode.airDate, 'yyyy.MM.dd - HH:mm')}
            </span>
          )}

          {episode.runtime && (
            <span className="flex items-center gap-1 font-mono text-[9px] text-zinc-500">
              <IconCalendarTime size={10} className="text-gold-400" />
              {episode.runtime} min
            </span>
          )}

          {isUpcomingEpisode && (
            <span className="border-gold-400/20 bg-gold-400/10 text-gold-400 rounded border px-2 py-0.5 font-mono text-[8px] font-bold tracking-widest uppercase">
              Upcoming
            </span>
          )}
        </div>

        <h5
          className={`text-sm font-bold ${
            isUpcomingEpisode
              ? 'text-zinc-300'
              : isWatched
                ? 'font-light text-zinc-500 line-through'
                : 'text-zinc-200'
          }`}
        >
          {episode.name}
        </h5>

        {!isUpcomingEpisode && episode.overview && (
          <p className="max-w-2xl font-sans text-xs leading-relaxed font-light text-zinc-400">
            {episode.overview}
          </p>
        )}

        {/* Ratings & Notes */}
        {isWatched && (
          <div className="flex flex-wrap items-center gap-4 pt-2">
            {episode.tracking?.rating ? (
              <div className="border-gold-400/10 bg-gold-400/5 text-gold-400 flex items-center gap-1 rounded border px-2 py-0.5 text-xs">
                <IconStar className="fill-gold-400" size={11} />
                <span className="font-mono font-bold">{episode.tracking.rating} / 5</span>
              </div>
            ) : null}

            {episode.tracking?.notes ? (
              <p className="line-clamp-1 flex max-w-xl items-center gap-1.5 text-xs font-light text-zinc-500 italic">
                <IconMessage size={11} className="text-gold-400 shrink-0" />
                <span>{episode.tracking.notes}</span>
              </p>
            ) : null}
          </div>
        )}
      </div>

      {/* Review button */}
      {isWatched && !isUpcomingEpisode && (
        <button className="text-gold-400 flex cursor-pointer items-center gap-1 self-center rounded-xl border border-zinc-800 bg-zinc-900/80 px-3 py-2 font-mono text-[9.5px] tracking-widest uppercase transition-colors hover:bg-zinc-800">
          <IconEdit size={11} />
          <span>
            {episode.tracking?.rating || episode.tracking?.notes ? 'Edit Notes' : 'Add Notes'}
          </span>
        </button>
      )}
    </li>
  );
};
