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
  const overview = isEpisode ? (media.episodes[0]?.overview ?? '') : '';

  const expandedContentId = `upcoming-${mediaType}-${mediaTmdbId}-${media.airDate?.getTime()}`;

  return (
    <li className="group relative flex items-stretch gap-3 pl-1 transition-all duration-200">
      <div className="flex shrink-0 flex-col justify-center py-2 text-right select-none">
        <div className="text-micro leading-none font-bold tracking-wider text-accent-ink uppercase">
          {fullMonth}
        </div>

        <div className="mt-1 text-base leading-none font-extrabold text-ink">
          {day?.toString().padStart(2, '0')}
        </div>
      </div>

      <div
        className={clsx(
          'glass-card glass-card-interactive min-w-0 flex-1 rounded-card p-3 transition-colors',
          isBatch && 'has-[:checked]:border-accent-line has-[:checked]:bg-accent-bright/5',
        )}
      >
        {isBatch && <input id={expandedContentId} type="checkbox" className="peer sr-only" />}

        <div className="flex min-w-0 items-center justify-between gap-3">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div className="relative h-15 w-11 shrink-0 overflow-hidden rounded-control border border-line bg-surface-raised shadow-card select-none">
              <MediaPosterImage title={mediaName} path={posterPath} alt={mediaName} size="w185" />

              <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-black/10" />

              {isBatch && (
                <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-0.5 bg-black/70 py-0.5 text-micro font-bold text-accent-ink backdrop-blur-sm">
                  <IconStack size={9} />×{episodes.length}
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1 space-y-0.5">
              <div className="mb-1 flex flex-wrap items-center gap-x-2">
                <h4 className="truncate text-sm font-bold text-ink transition-colors group-hover:text-accent-ink">
                  {title}
                </h4>

                {remainingDays && (
                  <span className="apple-badge border border-info/30 bg-surface-soft text-micro text-info">
                    {remainingDays}
                  </span>
                )}

                {isBatch && (
                  <span className="apple-badge border border-accent-line bg-accent-bright/15 text-micro text-accent-ink">
                    {episodes.length} episodes
                  </span>
                )}
              </div>

              <p className="truncate text-xs text-ink-secondary">{subTitle}</p>

              <p className="truncate text-micro text-ink-muted peer-checked:hidden">{overview}</p>
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
                  'bg-surface-soft text-ink-secondary hover:bg-surface-soft-hover hover:text-ink',
                  'peer-checked:bg-accent-bright/20 peer-checked:text-accent-tint',
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
              className="apple-pill-btn flex shrink-0 cursor-pointer items-center gap-1 bg-surface-soft px-3 py-1 text-xs text-accent-ink hover:bg-surface-soft-hover"
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
                <ul className="space-y-1.5 border-t border-line pt-2.5">
                  {episodes.map((episode) => (
                    <li
                      key={episode.id}
                      className="flex items-center gap-2.5 rounded-control border border-line bg-black/30 px-2.5 py-2 transition-colors hover:border-accent-line hover:bg-accent-bright/5"
                    >
                      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-xs border border-accent-line bg-accent-bright/15 text-micro font-extrabold text-accent-tint select-none">
                        {episode.episodeNumber}
                      </span>

                      <div className="min-w-0 flex-1 space-y-0.5">
                        <p className="truncate text-xs font-semibold text-ink">
                          <span className="mr-1.5 font-mono text-micro font-bold text-accent-ink/90">
                            S{episode.seasonNumber}:E{episode.episodeNumber}
                          </span>

                          {episode.name}
                        </p>

                        {episode.overview && (
                          <p className="line-clamp-2 text-micro leading-relaxed text-ink-muted">
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
