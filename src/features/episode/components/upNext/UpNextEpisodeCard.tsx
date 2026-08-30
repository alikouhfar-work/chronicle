import { FC } from 'react';
import { getPosterPlaceholderColor } from '@/utils/getPosterPlaceholderColor';
import { UpNextEpisodeCardProps } from '@/features/episode/types/upNextShowCard';
import { format } from 'date-fns';
import { getTmdbImageUrl } from '@/utils/getTmdbImageUrl';
import Image from 'next/image';
import Link from 'next/link';
import { UpNextEpisodeCardWatchButton } from '@/features/episode/components/upNext/UpNextEpisodeCardWatchButton';

export const UpNextEpisodeCard: FC<UpNextEpisodeCardProps> = ({ episode }) => {
  return (
    <li className="group cursor-default glass-card glass-card-interactive relative flex flex-col items-start justify-between gap-4 rounded-2xl p-4 md:flex-row md:items-center">
      <div className="flex w-full min-w-0 flex-1 flex-col items-start gap-4 sm:flex-row">
        <div
          className={`h-20 w-16 rounded-xl bg-linear-to-br ${getPosterPlaceholderColor(episode.name)} relative flex shrink-0 flex-col justify-between overflow-hidden border border-white/15 p-2 shadow-md transition-all select-none group-hover:border-violet-400/50`}
        >
          {episode.posterPath && (
            <Image
              fill
              alt={episode.showName}
              src={getTmdbImageUrl(episode.posterPath, 'backdrop', 'w92')!}
            />
          )}
          <span className="text-[9px] font-bold tracking-tight text-violet-400 uppercase">TV</span>
          <div className="line-clamp-2 text-[11px] leading-tight font-bold tracking-tight text-white">
            {episode.showName}
          </div>
          <div className="h-1 w-full overflow-hidden rounded-full bg-black/40">
            <div className="h-full w-3/4 rounded-full bg-violet-400" />
          </div>
        </div>

        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="truncate text-left text-base font-bold text-white transition-colors group-hover:text-violet-300 sm:text-lg">
              {episode.showName}
            </h4>
            <span className="apple-badge border border-violet-500/25 bg-violet-500/15 text-[11px] text-violet-300">
              Season {episode.seasonNumber} • Episode {episode.episodeNumber}
            </span>
            {episode.airDate && (
              <span className="text-xs text-zinc-400">{format(episode.airDate, 'yyyy-MM-dd')}</span>
            )}
          </div>
          <h4 className="text-xs font-semibold text-zinc-300">{episode.name}</h4>
          <p className="line-clamp-2 text-xs leading-relaxed font-normal truncate text-zinc-400">
            {episode.overview || 'N/A'}
          </p>
        </div>
      </div>

      <div className="flex w-full shrink-0 items-center justify-end gap-2.5 border-t border-white/8 pt-3 md:w-auto md:border-t-0 md:pt-0">
        <Link
          href={`/library/tv/${episode.showTmdbId}`}
          className="apple-pill-btn cursor-pointer border border-white/10 bg-white/6 px-4 py-2 text-xs text-zinc-200 hover:bg-white/12"
        >
          View Details
        </Link>
        <UpNextEpisodeCardWatchButton showId={episode.showId} episodeId={episode.id} />
      </div>
    </li>
  );
};
