import { FC } from 'react';
import { IconDeviceTv, IconMovie, IconStar } from '@tabler/icons-react';
import { PersonDetailsFilmographyCardProps } from '@/features/person/types/personDetailsFilmographyCard';
import { getTmdbImageUrl } from '@/utils/getTmdbImageUrl';
import Image from 'next/image';
import { ViewDetailsButton } from '@/features/library/components/ViewDetailsButton';
import { TrackButton } from '@/features/library/components/TrackButton';

export const PersonDetailsFilmographyCard: FC<PersonDetailsFilmographyCardProps> = ({
  combinedCredit,
}) => {
  const releaseDate = combinedCredit.releaseDate;
  const year = releaseDate ? releaseDate.substring(0, 4) : '—';

  return (
    <li className="group glass-card flex flex-col justify-between overflow-hidden rounded-2xl border border-white/8 transition-all duration-300 hover:border-violet-500/40 hover:shadow-xl hover:shadow-violet-500/10">
      {/* Poster Area */}
      <div className="relative aspect-2/3 w-full shrink-0 cursor-pointer overflow-hidden border-b border-white/8 bg-zinc-950 select-none">
        {combinedCredit.posterPath ? (
          <Image
            fill
            alt={combinedCredit.name}
            src={getTmdbImageUrl(combinedCredit.posterPath, 'backdrop', 'w500')!}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center bg-linear-to-br from-zinc-800 via-zinc-900 to-violet-950/40 p-3 text-center">
            {combinedCredit.mediaType === 'movie' ? (
              <IconMovie className="mb-1.5 text-violet-400 opacity-70" size={24} />
            ) : (
              <IconDeviceTv className="mb-1.5 text-violet-400 opacity-70" size={24} />
            )}
            <span className="line-clamp-2 text-xs font-bold text-white">{combinedCredit.name}</span>
          </div>
        )}

        <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-2 left-2 z-10 flex items-center gap-1">
          <span className="apple-badge border border-white/10 bg-black/60 text-[9px] text-zinc-300 backdrop-blur-md">
            {combinedCredit.mediaType === 'movie' ? 'Film' : 'Series'}
          </span>
        </div>

        <div className="absolute top-2 right-2 z-10 flex items-center gap-1">
          <span className="rounded-full border border-white/10 bg-black/60 px-1.5 py-0.5 text-[9px] font-bold text-zinc-300 backdrop-blur-md">
            {year}
          </span>
        </div>

        {/* Rating at bottom */}
        {combinedCredit.rating > 0 && (
          <div className="absolute right-2 bottom-2 z-10 flex items-center gap-1 rounded-full border border-white/10 bg-black/70 px-2 py-0.5 text-[10px] font-bold text-amber-400 backdrop-blur-md">
            <IconStar size={10} className="fill-amber-400 text-amber-400" />
            <span>{combinedCredit.rating.toFixed(1)}</span>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="flex flex-1 flex-col justify-between gap-3 p-3.5">
        <div className="space-y-1">
          <h4 className="line-clamp-1 cursor-pointer text-xs leading-tight font-bold text-white transition-colors group-hover:text-violet-300">
            {combinedCredit.name}
          </h4>

          {combinedCredit.character && (
            <p className="line-clamp-1 text-[11px] text-zinc-400" title={combinedCredit.character}>
              as
              <span className="ml-1 font-medium text-violet-300">
                &#34;{combinedCredit.character}&#34;
              </span>
            </p>
          )}
        </div>

        {/* Action Button */}
        <div className="border-t border-white/8 pt-2">
          {combinedCredit.isTracked ? (
            <ViewDetailsButton
              unstyled
              showIcon
              tmdbId={combinedCredit.id}
              mediaType={combinedCredit.mediaType}
              className="w-full border border-violet-500/25 bg-violet-500/15 py-1.5 text-[11px] font-bold text-violet-300 transition-all hover:bg-violet-500/25"
            />
          ) : (
            <TrackButton
              unstyled
              tmdbId={combinedCredit.id}
              mediaType={combinedCredit.mediaType}
              className="w-full border border-white/10 bg-white/6 py-1.5 text-[11px] font-semibold text-zinc-300 shadow-sm transition-all hover:bg-violet-500 hover:text-white"
            />
          )}
        </div>
      </div>
    </li>
  );
};
