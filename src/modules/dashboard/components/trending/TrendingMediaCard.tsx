import type { TrendingMediaCardProps } from '@/shared/types/trending';
import type { TrendingShow } from '@/modules/show';
import type { TrendingMovie } from '@/modules/movie';
import { IconCircleFilled } from '@tabler/icons-react';
import { LibraryMediaViewDetailsButton } from '@/modules/library/components/LibraryMediaViewDetailsButton';
import { LibraryMediaTrackButton } from '@/modules/library/components/LibraryMediaTrackButton';
import { MediaPosterImage } from '@/shared/ui/MediaPosterImage';

export const TrendingMediaCard = <T extends TrendingShow | TrendingMovie>({
  media,
}: TrendingMediaCardProps<T>) => {
  return (
    <li className="group glass-card glass-card-interactive relative flex min-w-70 cursor-default flex-col justify-between overflow-hidden rounded-card shadow-xl">
      <div className="relative aspect-video w-full shrink-0 overflow-hidden border-b border-line select-none">
        <MediaPosterImage title={media.name} path={media.backdropPath} alt={media.name} size="w300" />
        <div className="absolute inset-0 bg-linear-to-b from-black/10 via-black/40 to-surface-sunken" />

        <div className="absolute inset-0 z-10 flex flex-col justify-between p-3.5">
          <div className="flex items-start justify-end gap-2">
            <div className="flex items-center gap-1 rounded-pill border border-warning/30 bg-black/60 px-2 py-0.5 text-micro font-bold text-rating backdrop-blur-md">
              <span>★</span>
              <span>{media.rating.toFixed(1)}</span>
            </div>
          </div>

          <h4 className="truncate text-sm font-bold text-ink transition-colors group-hover:text-accent-ink">
            {media.name}
          </h4>
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-between gap-3 p-4">
        <div className="space-y-2">
          <p className="text-xs font-medium text-ink-muted">
            {media.releaseDate.substring(0, 4) ?? 'N/A'}
            <IconCircleFilled className="mx-1.5 mb-0.5 inline-block size-1.5" />
            {media.genres.map((genre) => genre.name).join(', ')}
          </p>

          <div className="space-y-1">
            <p className="line-clamp-3 text-xs leading-relaxed font-normal text-ink-muted">
              {media.overview}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-line pt-3">
          <span className="text-micro font-medium text-ink-muted">
            {new Intl.NumberFormat('en-US', {
              notation: 'compact',
              compactDisplay: 'short',
            }).format(media.voteCount)}{' '}
            reviews
          </span>

          {media.isTracked ? (
            <LibraryMediaViewDetailsButton tmdbId={media.id} mediaType={media.mediaType} />
          ) : (
            <LibraryMediaTrackButton tmdbId={media.id} mediaType={media.mediaType} />
          )}
        </div>
      </div>
    </li>
  );
};
