import type { UpcomingMediaCardProps } from '@/shared/types/upcoming';
import type { MappedUpcomingEpisode } from '@/modules/episode-season/types/upcomingEpisode';
import type { MappedUpcomingMovie } from '@/modules/movie/types/upcomingMovie';
import { getDaysUntilAirDate } from '@/shared/lib/getDaysUntilAirDate';
import { IconChevronDown, IconChevronRight, IconStack } from '@tabler/icons-react';
import { MediaPosterImage } from '@/shared/ui/MediaPosterImage';
import { clsx } from 'clsx';
import Link from 'next/link';

export const UpcomingMediaCard = <T extends MappedUpcomingEpisode | MappedUpcomingMovie>({
  media,
  title,
  subTitle,
  mediaType,
}: UpcomingMediaCardProps<T>) => {
  const day = media.airDate?.getDate();
  const remainingDays = getDaysUntilAirDate(media.airDate);
  const fullMonth = media.airDate?.toLocaleString('default', { month: 'short' });

  const isEpisode = 'episodes' in media;
  const episodes = isEpisode ? media.episodes : [];
  const isBatch = isEpisode && episodes.length > 1;

  const posterPath = media.posterPath;
  const mediaTmdbId = isEpisode ? media.showTmdbId : media.tmdbId;
  const mediaName = isEpisode ? media.showName : media.name;
  const overview = isEpisode ? media.episodes[0].overview : '';

  const expandedContentId = `upcoming-${mediaType}-${mediaTmdbId}-${media.airDate?.getTime()}`;

  return (
    <li className="group relative flex items-stretch gap-3 pl-1 transition-all duration-200">
      <div className="flex shrink-0 flex-col justify-center py-2 text-right select-none">
        <div className="text-[10px] leading-none font-bold tracking-wider text-violet-400 uppercase">
          {fullMonth}
        </div>

        <div className="mt-1 text-base leading-none font-extrabold text-white">
          {day?.toString().padStart(2, '0')}
        </div>
      </div>

      <div
        className={clsx(
          'glass-card glass-card-interactive min-w-0 flex-1 rounded-2xl p-3 transition-colors',
          isBatch && 'has-[:checked]:border-violet-500/25 has-[:checked]:bg-violet-500/5',
        )}
      >
        {isBatch && <input id={expandedContentId} type="checkbox" className="peer sr-only" />}

        <div className="flex min-w-0 items-center justify-between gap-3">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div className="relative h-15 w-11 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-zinc-900 shadow-md select-none">
              <MediaPosterImage title={mediaName} path={posterPath} alt={mediaName} size="w185" />

              <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-black/10" />

              {isBatch && (
                <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-0.5 bg-black/70 py-0.5 text-[9px] font-bold text-violet-300 backdrop-blur-sm">
                  <IconStack size={9} />×{episodes.length}
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1 space-y-0.5">
              <div className="mb-1 flex flex-wrap items-center gap-x-2">
                <h4 className="truncate text-sm font-bold text-white transition-colors group-hover:text-violet-300">
                  {title}
                </h4>

                {remainingDays && (
                  <span className="apple-badge border border-indigo-500/20 bg-white/8 text-[10px] text-indigo-300">
                    {remainingDays}
                  </span>
                )}

                {isBatch && (
                  <span className="apple-badge border border-violet-500/25 bg-violet-500/15 text-[10px] text-violet-300">
                    {episodes.length} episodes
                  </span>
                )}
              </div>

              <p className="truncate text-xs text-zinc-300">{subTitle}</p>

              <p className="truncate text-[11px] text-zinc-400 peer-checked:hidden">{overview}</p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            {isBatch && (
              <label
                htmlFor={expandedContentId}
                aria-label={`Show all ${episodes.length} episodes`}
                title={`Show all ${episodes.length} episodes`}
                className={clsx(
                  'apple-pill-btn flex cursor-pointer items-center px-2.5 py-1 text-xs transition-colors',
                  'bg-white/6 text-zinc-300 hover:bg-white/12 hover:text-white',
                  'peer-checked:bg-violet-500/20 peer-checked:text-violet-200',
                )}
              >
                <IconChevronDown
                  size={14}
                  className="transition-transform duration-300 peer-checked:rotate-180"
                />
              </label>
            )}

            <Link
              href={`/library/${mediaType}/${mediaTmdbId}`}
              className="apple-pill-btn flex shrink-0 cursor-pointer items-center gap-1 bg-white/6 px-3 py-1 text-xs text-violet-400 hover:bg-white/12"
            >
              View <IconChevronRight size={12} />
            </Link>
          </div>
        </div>

        {isBatch && (
          <div
            id={`${expandedContentId}-content`}
            className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] peer-checked:grid-rows-[1fr]"
          >
            <div className="min-h-0 overflow-hidden">
              <div className="mt-2.5">
                <ul className="space-y-1.5 border-t border-white/8 pt-2.5">
                  {episodes.map((episode) => (
                    <li
                      key={episode.id}
                      className="flex items-center gap-2.5 rounded-xl border border-white/6 bg-black/30 px-2.5 py-2 transition-colors hover:border-violet-500/20 hover:bg-violet-500/5"
                    >
                      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-violet-500/25 bg-violet-500/15 text-[10px] font-extrabold text-violet-200 select-none">
                        {episode.episodeNumber}
                      </span>

                      <div className="min-w-0 flex-1 space-y-0.5">
                        <p className="truncate text-xs font-semibold text-zinc-100">
                          <span className="mr-1.5 font-mono text-[10px] font-bold text-violet-400/90">
                            S{episode.seasonNumber}:E{episode.episodeNumber}
                          </span>

                          {episode.name}
                        </p>

                        {episode.overview && (
                          <p className="line-clamp-2 text-[11px] leading-relaxed text-zinc-400">
                            {episode.overview}
                          </p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </li>
  );
};
