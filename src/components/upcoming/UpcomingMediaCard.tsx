import { getPosterPlaceholderColor } from '@/utils/getPosterPlaceholderColor';
import { UpcomingMediaCardProps } from '@/types/upcoming';
import { MappedUpcomingEpisode } from '@/features/episode/types/upcomingEpisode';
import { getDaysUntilAirDate } from '@/utils/getDaysUntilAirDate';
import { MappedUpcomingMovie } from '@/features/movie/types/upcomingMovie';
import { IconChevronRight } from '@tabler/icons-react';
import { getTmdbImageUrl } from '@/utils/getTmdbImageUrl';
import Image from 'next/image';
import Link from 'next/link';

export const UpcomingMediaCard = async <T extends MappedUpcomingEpisode | MappedUpcomingMovie>({
  media,
  title,
  subTitle,
  mediaType,
}: UpcomingMediaCardProps<T>) => {
  const day = media.airDate?.getDate();
  const remainingDays = getDaysUntilAirDate(media.airDate);
  const fullMonth = media.airDate?.toLocaleString('default', { month: 'short' });
  const isEpisodeRelease = (
    media: MappedUpcomingEpisode | MappedUpcomingMovie,
  ): media is MappedUpcomingEpisode => 'episodes' in media;
  const isEpisode = isEpisodeRelease(media);

  const posterPath = media.posterPath;
  const mediaTmdbId = isEpisode ? media.showTmdbId : media.tmdbId;
  const mediaName = isEpisode ? media.showName : media.name;

  const overview = isEpisode ? media.episodes[0].overview : '';

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

      <div className="glass-card glass-card-interactive flex min-w-0 flex-1 items-center justify-between gap-3 rounded-2xl p-3">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="relative h-15 w-11 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-zinc-900 shadow-md select-none">
            <div
              className={`flex h-full w-full items-center justify-center bg-linear-to-br ${getPosterPlaceholderColor(mediaName)}`}
            />

            {posterPath && (
              <Image fill alt={mediaName} src={getTmdbImageUrl(posterPath, 'backdrop', 'w92')!} />
            )}

            <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-black/10" />
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
            </div>

            <p className="truncate text-xs text-zinc-300">{subTitle}</p>

            <p className="truncate text-[11px] text-zinc-400">{overview}</p>
          </div>
        </div>

        <Link
          href={`/library/${mediaType}/${mediaTmdbId}`}
          className="apple-pill-btn flex shrink-0 cursor-pointer items-center gap-1 bg-white/6 px-3 py-1 text-xs text-violet-400 hover:bg-white/12"
        >
          View <IconChevronRight size={12} />
        </Link>
      </div>
    </li>
  );
};
