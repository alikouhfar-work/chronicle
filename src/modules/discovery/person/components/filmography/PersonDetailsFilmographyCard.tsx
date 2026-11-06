import { IconDeviceTv, IconMovie, IconStar } from '@tabler/icons-react';
import type { PersonDetailsFilmographyCardProps } from '@/modules/discovery/person/types/personDetailsFilmographyCard';
import { getTmdbImageUrl } from '@/infra/tmdb/images';
import Image from 'next/image';
import { LibraryMediaViewDetailsButton } from '@/modules/library/components/LibraryMediaViewDetailsButton';
import { LibraryMediaTrackButton } from '@/modules/library/components/LibraryMediaTrackButton';

export const PersonDetailsFilmographyCard = ({
  combinedCredit,
}: PersonDetailsFilmographyCardProps) => {
  const releaseDate = combinedCredit.releaseDate;
  const year = releaseDate ? releaseDate.substring(0, 4) : '—';

  return (
    <li className="group glass-card flex flex-col justify-between overflow-hidden rounded-card border border-line transition-all duration-300 hover:border-accent-line hover:shadow-xl hover:shadow-accent/20">
      <div className="relative aspect-2/3 w-full shrink-0 overflow-hidden border-b border-line bg-surface-sunken select-none">
        {combinedCredit.posterPath ? (
          <Image
            fill
            alt={combinedCredit.name}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            src={getTmdbImageUrl(combinedCredit.posterPath, 'backdrop', 'w500')!}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center bg-linear-to-br from-surface-strong via-surface-raised to-accent/20 p-3 text-center">
            {combinedCredit.mediaType === 'movie' ? (
              <IconMovie className="mb-1.5 text-accent-ink opacity-70" size={24} />
            ) : (
              <IconDeviceTv className="mb-1.5 text-accent-ink opacity-70" size={24} />
            )}
            <span className="line-clamp-2 text-xs font-bold text-ink">{combinedCredit.name}</span>
          </div>
        )}

        <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent" />

        <div className="absolute top-2 left-2 z-10 flex items-center gap-1">
          <span className="apple-badge border border-line bg-black/60 text-micro text-ink-secondary backdrop-blur-md">
            {combinedCredit.mediaType === 'movie' ? 'Film' : 'Series'}
          </span>
        </div>

        <div className="absolute top-2 right-2 z-10 flex items-center gap-1">
          <span className="rounded-pill border border-line bg-black/60 px-1.5 py-0.5 text-micro font-bold text-ink-secondary backdrop-blur-md">
            {year}
          </span>
        </div>

        {combinedCredit.rating > 0 && (
          <div className="absolute right-2 bottom-2 z-10 flex items-center gap-1 rounded-pill border border-line bg-black/70 px-2 py-0.5 text-micro font-bold text-rating backdrop-blur-md">
            <IconStar size={10} className="fill-rating text-rating" />
            <span>{combinedCredit.rating.toFixed(1)}</span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col justify-between gap-3 p-3.5">
        <div className="space-y-1">
          <h4 className="line-clamp-1 text-xs leading-tight font-bold text-ink transition-colors group-hover:text-accent-ink">
            {combinedCredit.name}
          </h4>

          {combinedCredit.character && (
            <p className="line-clamp-1 text-micro text-ink-muted" title={combinedCredit.character}>
              as
              <span className="ml-1 font-medium text-accent-ink">
                &#34;{combinedCredit.character}&#34;
              </span>
            </p>
          )}
        </div>

        <div className="border-t border-line pt-2">
          {combinedCredit.isTracked ? (
            <LibraryMediaViewDetailsButton
              unstyled
              showIcon
              tmdbId={combinedCredit.id}
              mediaType={combinedCredit.mediaType}
              className="w-full border border-accent-line bg-accent-bright/15 py-1.5 text-micro font-bold text-accent-ink transition-all hover:bg-accent-bright/25"
            />
          ) : (
            <LibraryMediaTrackButton
              unstyled
              tmdbId={combinedCredit.id}
              mediaType={combinedCredit.mediaType}
              className="w-full border border-line bg-surface-soft py-1.5 text-micro font-semibold text-ink-secondary shadow-sm transition-all hover:bg-accent-bright hover:text-ink"
            />
          )}
        </div>
      </div>
    </li>
  );
};
