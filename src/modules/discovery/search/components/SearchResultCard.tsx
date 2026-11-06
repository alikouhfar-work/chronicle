import { IconDeviceTv, IconGlobe, IconLanguage, IconMovie, IconStar } from '@tabler/icons-react';
import Link from 'next/link';
import type { SearchResultCardProps } from '@/modules/discovery/search/types/searchResultCard';
import { SearchResultCardActions } from '@/modules/discovery/search/components/SearchResultCardActions';
import Image from 'next/image';
import { getTmdbImageUrl } from '@/infra/tmdb/images';
import { getGradientForTitle } from '@/shared/lib/getGradientForTitle';

export const SearchResultCard = ({
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
}: SearchResultCardProps) => {
  const isMovie = mediaType === 'movie';
  const detailsHref = `/search/${mediaType}/${id}`;

  return (
    <li className="group glass-card glass-card-interactive flex h-full w-full flex-col overflow-hidden rounded-card border border-line shadow-xl transition-all duration-300">
      <Link
        href={detailsHref}
        aria-label={`View details for ${name}`}
        className="relative block aspect-3/4 w-full shrink-0 cursor-pointer overflow-hidden border-b border-line bg-surface-sunken select-none"
      >
        {posterPath ? (
          <Image
            fill
            alt={name}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            src={getTmdbImageUrl(posterPath, 'backdrop', 'w500')!}
          />
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
          {isMovie ? (
            <span className="apple-badge border border-line bg-black/60 text-micro text-ink-secondary backdrop-blur-md">
              <IconMovie size={10} className="text-accent-ink" />
              <span>Movie</span>
            </span>
          ) : (
            <span className="apple-badge border border-line bg-black/60 text-micro text-ink-secondary backdrop-blur-md">
              <IconDeviceTv size={10} className="text-accent-ink" />
              <span>Series</span>
            </span>
          )}
          <span className="rounded-pill border border-line bg-black/60 px-2 py-0.5 text-micro font-semibold text-ink-secondary backdrop-blur-md">
            {year}
          </span>
        </div>

        {/* Rating Badge */}
        <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1 rounded-pill border border-line bg-black/60 px-2 py-0.5 text-micro font-bold text-rating backdrop-blur-md">
          <IconStar size={10} className="fill-rating text-rating" />
          <span>{rating ? rating.toFixed(1) : 'N/A'}</span>
        </div>
      </Link>

      <div className="flex flex-1 flex-col justify-between space-y-3 p-4">
        <div className="space-y-1.5">
          <Link href={detailsHref} aria-label={`View details for ${name}`}>
            <h3 className="line-clamp-1 cursor-pointer text-sm leading-snug font-bold text-ink transition-colors group-hover:text-accent-ink hover:text-accent-ink">
              {name}
            </h3>
          </Link>

          <div className="flex flex-wrap items-center gap-1">
            {originalLanguage && (
              <span className="flex items-center gap-1 rounded-pill border border-line bg-surface-soft px-2 py-0.5 text-micro font-semibold text-ink-secondary">
                <IconLanguage size={9} className="text-ink-muted" />
                {originalLanguage}
              </span>
            )}
            {countries && (
              <span className="flex items-center gap-1 rounded-pill border border-line bg-surface-soft px-2 py-0.5 text-micro font-semibold text-ink-secondary">
                <IconGlobe size={9} className="text-ink-muted" />
                {countries}
              </span>
            )}
            {genres.map((genre) => (
              <span
                key={genre.id}
                className="rounded-pill border border-line bg-surface-soft px-2 py-0.5 text-micro text-ink-muted"
              >
                {genre.name}
              </span>
            ))}
          </div>

          <p className="line-clamp-2 pt-0.5 text-xs leading-relaxed font-normal text-ink-muted">
            {overview || 'No synopsis available.'}
          </p>
        </div>

        {/* Bottom Actions */}
        <div className="border-t border-line pt-2">
          {isTracked ? (
            <div className="justify-betweenbg-surface-soft flex w-fit items-center">
              {/*<span className="apple-badge border border-accent-line bg-accent-bright/15 text-micro text-accent-ink">*/}
              {/*  <Check size={11} className="text-accent-ink" />*/}
              {/*  <span>{trackedMatch.trackedStatus}</span>*/}
              {/*</span>*/}
              <Link
                href={`/library/${mediaType}/${id}`}
                className="apple-pill-btn cursor-pointer border border-line bg-surface-soft px-3 py-2 text-micro text-ink hover:bg-surface-soft-hover"
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
