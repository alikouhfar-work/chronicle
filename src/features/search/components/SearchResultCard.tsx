import { IconDeviceTv, IconGlobe, IconLanguage, IconMovie, IconStar } from '@tabler/icons-react';
import { FC } from 'react';
import Link from 'next/link';
import { SearchResultCardProps } from '@/features/search/types/searchResultCard';
import { SearchResultCardActions } from '@/features/search/components/SearchResultCardActions';
import Image from 'next/image';
import { getTmdbImageUrl } from '@/utils/getTmdbImageUrl';
import { getGradientForTitle } from '@/utils/getGradientForTitle';

export const SearchResultCard: FC<SearchResultCardProps> = ({
  id,
  name,
  mediaType,
  posterPath,
  year,
  rating,
  genres,
  overview,
  countries,
  originalLanguage,
  isTracked,
}) => {
  const isMovie = mediaType === 'movie';

  return (
    <li className="group glass-card glass-card-interactive flex h-full w-full flex-col overflow-hidden rounded-2xl border border-white/8 shadow-xl transition-all duration-300">
      <div className="relative aspect-3/4 w-full shrink-0 overflow-hidden border-b border-white/8 bg-zinc-950 select-none">
        {posterPath ? (
          <Image fill alt={name} src={getTmdbImageUrl(posterPath, 'backdrop', 'w500')!} />
        ) : (
          <div
            className={`h-full w-full bg-linear-to-br ${getGradientForTitle(name)} flex flex-col items-center justify-center p-3 text-center`}
          >
            {isMovie ? <IconMovie size={10} /> : <IconDeviceTv size={10} />}
            {isMovie ? 'Movie' : 'Series'}
          </div>
        )}

        {/* Badges Overlay */}
        <div className="absolute top-2.5 left-2.5 z-10 flex max-w-[80%] flex-wrap items-center gap-1.5">
          <span className="rounded-full border border-white/10 bg-black/60 px-2 py-0.5 text-[10px] font-semibold text-zinc-300 backdrop-blur-md">
            {year}
          </span>
        </div>

        {/* Rating Badge */}
        <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1 rounded-full border border-white/10 bg-black/60 px-2 py-0.5 text-[10px] font-bold text-amber-400 backdrop-blur-md">
          <IconStar size={10} className="fill-amber-400 text-amber-400" />
          <span>{rating ? rating.toFixed(1) : 'N/A'}</span>
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-between space-y-3 p-4">
        <div className="space-y-1.5">
          <h3 className="line-clamp-1 text-sm leading-snug font-bold text-white transition-colors group-hover:text-violet-300">
            {name}
          </h3>

          <div className="flex flex-wrap items-center gap-1">
            {originalLanguage && (
              <span className="flex items-center gap-1 rounded-full border border-white/8 bg-white/6 px-2 py-0.5 text-[10px] font-semibold text-zinc-300">
                <IconLanguage size={9} className="text-zinc-400" />
                {originalLanguage}
              </span>
            )}
            {countries && (
              <span className="flex items-center gap-1 rounded-full border border-white/8 bg-white/6 px-2 py-0.5 text-[10px] font-semibold text-zinc-300">
                <IconGlobe size={9} className="text-zinc-400" />
                {countries}
              </span>
            )}
            {genres.map((genre) => (
              <span
                key={genre.id}
                className="rounded-full border border-white/[0.06] bg-white/4 px-2 py-0.5 text-[10px] text-zinc-400"
              >
                {genre.name}
              </span>
            ))}
          </div>

          <p className="line-clamp-2 pt-0.5 text-xs leading-relaxed font-normal text-zinc-400">
            {overview || 'No synopsis available.'}
          </p>
        </div>

        {/* Bottom Actions */}
        <div className="border-t border-white/8 pt-2">
          {isTracked ? (
            <div className="justify-betweenbg-white/4 flex w-fit items-center">
              {/*<span className="apple-badge border border-violet-500/25 bg-violet-500/15 text-[10px] text-violet-300">*/}
              {/*  <Check size={11} className="text-violet-400" />*/}
              {/*  <span>{trackedMatch.trackedStatus}</span>*/}
              {/*</span>*/}
              <Link
                href={`/library/${mediaType}/${id}`}
                className="apple-pill-btn cursor-pointer border border-white/8 bg-white/4 px-3 py-2 text-[10px] text-white hover:bg-white/15"
              >
                View in Library
              </Link>
            </div>
          ) : (
            <SearchResultCardActions id={id} mediaType={mediaType} />
          )}
        </div>
      </div>
    </li>
  );
};
