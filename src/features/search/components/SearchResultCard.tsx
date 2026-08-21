import {
  IconArrowRight,
  IconDeviceTv,
  IconGlobe,
  IconLanguage,
  IconMovie,
  IconStar,
} from '@tabler/icons-react';
import { FC } from 'react';
import Link from 'next/link';
import { SearchResultCardProps } from '@/features/search/types/searchResultCard';
import { SearchResultCardActions } from '@/features/search/components/SearchResultCardActions';
import Image from 'next/image';
import { getTmdbImageUrl } from '@/utils/getTmdbImageUrl';

export const SearchResultCard: FC<SearchResultCardProps> = ({
  id,
  adult,
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
    <div className="group hover:border-gold-500/40 flex h-full w-full flex-col overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/60 shadow-md transition-all duration-300 hover:bg-zinc-900/90 hover:shadow-2xl">
      <div className="relative aspect-3/4 w-full shrink-0 overflow-hidden bg-zinc-950 select-none">
        {posterPath && (
          <Image fill alt={name} src={getTmdbImageUrl(posterPath, 'backdrop', 'w500')!} />
        )}

        <div className="absolute top-2 left-2 flex max-w-[80%] flex-wrap items-center gap-1">
          <span className="border-gold-400/40 text-gold-400 flex items-center gap-1 rounded-md border bg-zinc-950/90 px-1.5 py-0.5 font-mono text-[9.5px] font-bold uppercase shadow backdrop-blur-md">
            {isMovie ? <IconMovie size={10} /> : <IconDeviceTv size={10} />}
            {isMovie ? 'Movie' : 'Series'}
          </span>
          {year && (
            <span className="rounded-md border border-zinc-700/60 bg-zinc-950/90 px-1.5 py-0.5 font-mono text-[9.5px] font-bold text-zinc-300 shadow backdrop-blur-md">
              {year}
            </span>
          )}
        </div>

        <div className="border-gold-400/40 text-gold-400 absolute top-2 right-2 flex items-center gap-1 rounded-md border bg-zinc-950/90 px-1.5 py-0.5 font-mono text-[9.5px] font-bold shadow backdrop-blur-md">
          <IconStar size={10} className="fill-gold-400 text-gold-400" />
          <span>{rating ? rating.toFixed(1) : 'N/A'}</span>
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-between space-y-2 p-5">
        <div className="space-y-3">
          <h3 className="group-hover:text-gold-300 line-clamp-1 font-serif text-lg leading-snug font-bold text-white transition-colors">
            {name}
          </h3>

          <div className="flex flex-wrap items-center gap-1 pt-0.5">
            {originalLanguage && (
              <span className="flex items-center gap-1 rounded border border-zinc-800 bg-zinc-950/80 px-1.5 py-0.5 font-mono text-[8.5px] text-zinc-300 uppercase">
                <IconLanguage size={10} className="text-zinc-400" />
                {originalLanguage}
              </span>
            )}
            {countries && (
              <span className="flex items-center gap-1 rounded border border-zinc-800 bg-zinc-950/80 px-1.5 py-0.5 font-mono text-[8.5px] text-zinc-300 uppercase">
                <IconGlobe size={10} className="text-zinc-400" />
                {countries}
              </span>
            )}
            {genres.map((genre) => (
              <span
                key={genre.id}
                className="rounded border border-zinc-800 bg-zinc-950/80 px-1.5 py-0.5 font-mono text-[8.5px] text-zinc-400"
              >
                {genre.name}
              </span>
            ))}
          </div>

          <p className="line-clamp-2 pt-0.5 font-sans text-[11px] leading-snug text-zinc-400">
            {overview || 'No overview available.'}
          </p>
        </div>

        <div className="border-zinc-850 flex items-center justify-between gap-1 border-t pt-2">
          {isTracked ? (
            <div className="flex w-full items-center justify-end">
              <Link
                href={`/library/${mediaType}/${id}`}
                className="bg-zinc-850 hover:bg-zinc-750 border-zinc-750 flex cursor-pointer items-center gap-1 rounded-lg border px-3 py-1 font-mono text-xs text-zinc-300 shadow-xs transition-all hover:border-zinc-600 hover:text-white"
              >
                <span>View</span>
                <span className="text-amber-400">
                  <IconArrowRight size={12} />
                </span>
              </Link>
            </div>
          ) : (
            <SearchResultCardActions id={id} mediaType={mediaType} />
          )}
        </div>
      </div>
    </div>
  );
};
