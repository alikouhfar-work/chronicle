import { getPosterPlaceholderColor } from '@/utils/getPosterPlaceholderColor';
import Image from 'next/image';
import { getTmdbImageUrl } from '@/utils/getTmdbImageUrl';
import { UpcomingMediaCardProps } from '@/types/upcoming';
import { MappedUpcomingEpisode } from '@/features/episode/types/upcomingEpisode';
import { getDaysUntilAirDate } from '@/utils/getDaysUntilAirDate';
import { IconChevronRight } from '@tabler/icons-react';
import { MappedUpcomingMovie } from '@/features/movie/types/upcomingMovie';

export const UpcomingMediaCard = async <T extends MappedUpcomingEpisode | MappedUpcomingMovie>({
  index,
  media,
  title,
  subTitle,
  mediaCount,
}: UpcomingMediaCardProps<T>) => {
  const day = media.airDate?.getDate();
  const remainingDays = getDaysUntilAirDate(media.airDate);
  const fullMonth = media.airDate?.toLocaleString('default', { month: 'short' });

  return (
    <li className="group relative flex items-stretch gap-3 transition-all duration-200 sm:gap-4">
      {/* Left Date Column */}
      <div className="flex shrink-0 flex-col justify-center py-3.5 text-right select-none">
        <div className="text-gold-400 font-mono text-[10px] leading-none font-bold tracking-wider uppercase sm:text-[11px]">
          {fullMonth}
        </div>
        <div className="mt-1 font-mono text-base leading-none font-black text-white sm:text-lg">
          {day?.toString().padStart(2, '0')}
        </div>
      </div>

      {/* Timeline Node Axis with Center Spine */}
      <div className="relative flex shrink-0 flex-col items-center self-stretch">
        <div
          className={`w-px flex-1 ${index === 0 ? 'bg-transparent' : 'bg-zinc-800 group-hover:bg-zinc-700'} transition-colors`}
        />
        <div className="border-gold-400 group-hover:border-gold-300 group-hover:bg-gold-400/30 z-10 my-1 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border-2 bg-zinc-950 ring-4 ring-zinc-950 transition-all duration-200 group-hover:scale-125 group-hover:shadow-[0_0_12px_rgba(250,204,21,0.6)]">
          <div className="bg-gold-400 group-hover:bg-gold-300 h-1 w-1 rounded-full transition-colors" />
        </div>
        <div
          className={`w-px flex-1 ${index === mediaCount - 1 ? 'bg-transparent' : 'bg-zinc-800 group-hover:bg-zinc-700'} transition-colors`}
        />
      </div>

      {/* Right Timeline Card */}
      <div className="border-zinc-850/90 hover:border-gold-400/40 my-1.5 flex min-w-0 flex-1 cursor-pointer flex-col justify-between gap-3 rounded-2xl border bg-zinc-900/40 p-3 shadow-sm transition-all duration-200 group-first:mt-0 group-last:mb-0 hover:bg-zinc-900/90 hover:shadow-lg hover:shadow-black/30 sm:my-2 sm:flex-row sm:items-center sm:gap-3.5 sm:p-3.5">
        {/* Artwork Preview Thumbnail */}
        <div className="flex min-w-0 flex-1 shrink-0 items-center gap-3">
          <div
            className={`h-14 w-10 rounded-xl bg-linear-to-br sm:h-15 sm:w-11 ${getPosterPlaceholderColor(media.name)} border-zinc-850 group-hover:border-zinc-750 relative flex shrink-0 flex-col justify-between overflow-hidden border p-1.5 shadow-md transition-all`}
          >
            {media.posterPath && (
              <Image
                fill
                alt={media.name}
                src={getTmdbImageUrl(media.posterPath, 'backdrop', 'w92')!}
              />
            )}
          </div>

          {/* Title & Details */}
          <div className="min-w-0 flex-1">
            <div className="mb-0.5 flex flex-wrap items-center justify-between gap-2">
              <h4 className="group-hover:text-gold-300 truncate font-serif text-xs font-bold text-white transition-colors sm:text-sm">
                {title}
              </h4>
              {remainingDays && (
                <span className="text-gold-400 bg-gold-400/10 border-gold-400/25 shrink-0 rounded-full border px-1.5 py-0.5 font-mono text-[9px] font-bold">
                  {remainingDays}
                </span>
              )}
            </div>
            <p className="truncate text-[11px] font-medium text-zinc-300 sm:text-xs">{subTitle}</p>
            <p className="xs:block mt-0.5 line-clamp-1 hidden text-[10px] leading-relaxed text-zinc-400 sm:line-clamp-2">
              {media.overview || 'N/A'}
            </p>
          </div>
        </div>

        {/* Interactive cue / link */}
        <div className="flex shrink-0 items-center gap-1 self-end pt-0.5 sm:self-center sm:pt-0">
          <div className="group-hover:text-gold-400 rounded-lg p-1 text-zinc-600 transition-all group-hover:translate-x-0.5">
            <IconChevronRight
              size={12}
              className="transition-transform group-hover:translate-x-0.5"
            />
          </div>
        </div>
      </div>
    </li>
  );
};
