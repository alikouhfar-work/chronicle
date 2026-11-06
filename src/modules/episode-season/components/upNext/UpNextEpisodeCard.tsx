import { getPosterPlaceholderColor } from '@/infra/tmdb/images';
import type { UpNextEpisodeCardProps } from '@/modules/episode-season/types/upNextShowCard';
import { format } from 'date-fns';
import { getTmdbImageUrl } from '@/infra/tmdb/images';
import Image from 'next/image';
import Link from 'next/link';
import { UpNextEpisodeCardWatchButton } from '@/modules/episode-season/components/upNext/UpNextEpisodeCardWatchButton';

export const UpNextEpisodeCard = ({ episode }: UpNextEpisodeCardProps) => {
  return (
    <li className="group cursor-default glass-card glass-card-interactive relative flex flex-col items-start justify-between gap-4 rounded-card p-4 md:flex-row md:items-center">
      <div className="flex w-full min-w-0 flex-1 flex-col items-start gap-4 sm:flex-row">
        <div
          className={`h-20 w-16 rounded-control bg-linear-to-br ${getPosterPlaceholderColor(episode.name)} relative flex shrink-0 flex-col justify-between overflow-hidden border border-line p-2 shadow-card transition-all select-none group-hover:border-accent-ink`}
        >
          {episode.posterPath && (
            <Image
              fill
              alt={episode.showName}
              sizes="64px"
              src={getTmdbImageUrl(episode.posterPath, 'backdrop', 'w92')!}
            />
          )}
          <span className="text-micro font-bold tracking-tight text-accent-ink uppercase">TV</span>
          <div className="line-clamp-2 text-micro leading-tight font-bold tracking-tight text-ink">
            {episode.showName}
          </div>
          <div className="h-1 w-full overflow-hidden rounded-pill bg-black/40">
            <div className="h-full w-3/4 rounded-pill bg-accent-strong" />
          </div>
        </div>

        <div className="min-w-0 flex-1 space-y-1 w-full">
          <div className="flex flex-wrap items-center gap-x-2">
            <h4 className="truncate text-left text-base font-bold text-ink transition-colors group-hover:text-accent-ink sm:text-lg">
              {episode.showName}
            </h4>
            <span className="apple-badge border border-accent-line bg-accent-bright/15 text-micro text-accent-ink">
              Season {episode.seasonNumber} • Episode {episode.episodeNumber}
            </span>
            {episode.airDate && (
              <span className="text-xs text-ink-muted">{format(episode.airDate, 'yyyy-MM-dd')}</span>
            )}
          </div>
          <h4 className="text-xs font-semibold text-ink-secondary">{episode.name}</h4>
          <p className="line-clamp-2 text-xs leading-relaxed font-normal truncate text-ink-muted">
            {episode.overview || 'N/A'}
          </p>
        </div>
      </div>

      <div className="flex w-full shrink-0 items-center justify-end gap-2.5 border-t border-line pt-3 md:w-auto md:border-t-0 md:pt-0">
        <Link
          href={`/library/tv/${episode.showTmdbId}`}
          className="apple-pill-btn cursor-pointer border border-line bg-surface-soft px-4 py-2 text-xs text-ink-secondary hover:bg-surface-soft-hover"
        >
          View Details
        </Link>
        <UpNextEpisodeCardWatchButton showId={episode.showId} episodeId={episode.id} />
      </div>
    </li>
  );
};
