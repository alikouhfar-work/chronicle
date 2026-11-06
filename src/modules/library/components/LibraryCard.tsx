import type { LibraryCardProps } from '@/modules/library/types/libraryCard';
import Link from 'next/link';
import { LibraryMediaDeleteButton } from '@/modules/library/components/LibraryMediaDeleteButton';
import { LibraryCardStatus } from '@/modules/library/components/LibraryCardStatus';
import { LibraryShowProgress } from '@/modules/library/components/shows/LibraryShowProgress';
import { LibraryMovieRating } from '@/modules/library/components/movies/LibraryMovieRating';
import { MediaPosterImage } from '@/shared/ui/MediaPosterImage';
import { getShowLifecycle } from '@/modules/show/lib/showLifecycle';

export const LibraryCard = ({ media, mediaType }: LibraryCardProps) => {
  return (
    <li className="group glass-card glass-card-interactive relative aspect-2/3 w-full cursor-pointer overflow-hidden rounded-card border border-line shadow-xl transition-all duration-300 select-none hover:scale-[1.02] hover:border-line-strong hover:shadow-2xl">
      <Link href={`/library/${mediaType}/${media.tmdbId}`}>
        <MediaPosterImage
          title={media.name}
          path={media.posterPath}
          alt={media.name}
          size="w500"
          placeholderClassName="flex flex-col justify-between p-5 transition-transform duration-500 group-hover:scale-105"
        />

        <div className="from-canvas via-canvas/70 to-canvas/20 group-hover:via-canvas/50 absolute inset-0 bg-linear-to-t transition-all duration-300" />

        <div className="absolute inset-0 z-10 flex flex-col justify-between p-4">
          <div className="flex items-start justify-between gap-2">
              <div className="flex flex-wrap items-center gap-1.5">
                <LibraryCardStatus status={media.tracking?.status} />
              </div>

            <LibraryMediaDeleteButton mediaId={media.id} mediaType={mediaType} />
          </div>

          <div className="space-y-2">
            <div className="space-y-0.5">
              <p className="flex items-center gap-1.5 text-xs font-semibold text-accent-ink">
                {'releaseDate' in media
                  ? media.releaseDate?.getFullYear()
                  : media.firstAirDate?.getFullYear()}
              </p>
              <h4 className="line-clamp-2 text-base leading-snug font-bold text-ink drop-shadow-card transition-colors group-hover:text-accent-ink">
                {media.name}
              </h4>
              {media.tagline && (
                <p className="line-clamp-1 text-xs font-normal text-ink-muted italic">
                  &#34;{media.tagline}&#34;
                </p>
              )}
            </div>

            {media.genres && media.genres.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {media.genres.slice(0, 2).map((genre) => (
                  <span
                    key={genre.id}
                    className="rounded-pill border border-line bg-surface-soft px-2 py-0.5 text-micro font-medium text-ink-secondary"
                  >
                    {genre.name}
                  </span>
                ))}
              </div>
            )}

            {'seasons' in media && (
              <LibraryShowProgress
                seasons={media.seasons}
                lifecycle={getShowLifecycle(media.status, media.inProduction)}
                trackingStatus={media.tracking?.status}
              />
            )}

            {media.tracking && 'rating' in media.tracking && (
              <LibraryMovieRating rating={media.tracking.rating} />
            )}
          </div>
        </div>
      </Link>
    </li>
  );
};
