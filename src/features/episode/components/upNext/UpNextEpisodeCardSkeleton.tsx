import { FC } from 'react';
import { getPosterPlaceholderColor } from '@/utils/getPosterPlaceholderColor';
import { format } from 'date-fns';
import Image from 'next/image';
import { getTmdbImageUrl } from '@/utils/getTmdbImageUrl';
import Link from 'next/link';
import { UpNextEpisodeCardProps } from '@/features/episode/types/upNextShowCard';
import { UpNextEpisodeCardWatchButton } from '@/features/episode/components/upNext/UpNextEpisodeCardWatchButton';

export const UpNextEpisodeCard: FC<UpNextEpisodeCardProps> = ({ episode }) => {
  return (
    <li>
      <Link
        href={`/library/tv/${episode.showTmdbId}`}
        className="group border-zinc-850 hover:border-zinc-750/80 relative flex flex-col items-start justify-between gap-5 rounded-xl border bg-zinc-900/40 p-5 transition-all duration-300 hover:bg-zinc-900/90 md:flex-row md:items-center"
      >
        <div className="flex w-full min-w-0 flex-1 flex-col items-start gap-4 sm:flex-row">
          <div
            className={`h-20 w-14 rounded-lg bg-linear-to-br ${getPosterPlaceholderColor(episode.name)} relative flex shrink-0 flex-col justify-between overflow-hidden border border-zinc-800 p-2 shadow-md transition-all duration-300 select-none group-hover:border-zinc-700`}
          >
            {episode.posterPath && (
              <Image
                fill
                alt={episode.showName}
                src={getTmdbImageUrl(episode.posterPath, 'backdrop', 'w92')!}
              />
            )}
            <div className="pointer-events-none absolute inset-0 bg-linear-to-tr from-black/40 via-transparent to-transparent" />
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <div className="flex flex-col">
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="text-gold-400 hover:text-gold-300 max-w-full truncate text-left font-serif text-xl leading-tight font-extrabold transition-colors md:text-2xl">
                  {episode.showName}
                </h3>
                <span className="bg-zinc-850 rounded-md border border-zinc-700/40 px-2.5 py-1.5 font-mono text-[10px] font-bold tracking-wider text-zinc-300">
                  S{String(episode.seasonNumber).padStart(2, '0')} E
                  {String(episode.episodeNumber).padStart(2, '0')}
                </span>
                {episode.airDate && (
                  <span className="font-mono text-[10px] font-medium text-zinc-500">
                    ({format(episode.airDate, 'yyyy-MM-dd')})
                  </span>
                )}
              </div>
              <h4 className="text-sm font-bold text-zinc-100">{episode.name}</h4>
            </div>
            {episode.overview && (
              <p className="line-clamp-2 pr-4 text-xs leading-relaxed font-normal text-zinc-400">
                {episode.overview}
              </p>
            )}
          </div>
        </div>

        <div className="border-zinc-850/40 flex w-full shrink-0 items-center justify-end gap-2.5 border-t pt-3 md:w-auto md:border-t-0 md:pt-0">
          <UpNextEpisodeCardWatchButton showId={episode.showId} episodeId={episode.id} />
        </div>
      </Link>
    </li>
  );
};
