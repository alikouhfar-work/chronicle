import { TrendingMediaCardProps } from '@/types/trending';
import { TrendingShow } from '@/features/show';
import { TrendingMovie } from '@/features/movie';
import { getPosterPlaceholderColor } from '@/utils/getPosterPlaceholderColor';
import { IconCircleFilled } from '@tabler/icons-react';
import { LibraryMediaViewDetailsButton } from '@/features/library/components/LibraryMediaViewDetailsButton';
import { LibraryMediaTrackButton } from '@/features/library/components/LibraryMediaTrackButton';
import { getTmdbImageUrl } from '@/utils/getTmdbImageUrl';
import Image from 'next/image';

export const TrendingMediaCard = async <T extends TrendingShow | TrendingMovie>({
  media,
}: TrendingMediaCardProps<T>) => {
  return (
    <li className="group glass-card glass-card-interactive relative flex min-w-70 cursor-default flex-col justify-between overflow-hidden rounded-2xl shadow-xl">
      <div className="relative aspect-video w-full shrink-0 overflow-hidden border-b border-white/8 select-none">
        <div
          className={`absolute inset-0 bg-linear-to-br ${getPosterPlaceholderColor(media.name)}`}
        />
        {media.backdropPath && (
          <Image
            fill
            alt={media.name}
            src={getTmdbImageUrl(media.backdropPath, 'backdrop', 'w300')!}
          />
        )}
        <div className="absolute inset-0 bg-linear-to-b from-black/10 via-black/40 to-zinc-950" />

        <div className="absolute inset-0 z-10 flex flex-col justify-between p-3.5">
          <div className="flex items-start justify-end gap-2">
            <div className="flex items-center gap-1 rounded-full border border-amber-400/20 bg-black/60 px-2 py-0.5 text-[10px] font-bold text-amber-400 backdrop-blur-md">
              <span>★</span>
              <span>{media.rating.toFixed(1)}</span>
            </div>
          </div>

          <h4 className="truncate text-sm font-bold text-white transition-colors group-hover:text-violet-300">
            {media.name}
          </h4>
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-between gap-3 p-4">
        <div className="space-y-2">
          <p className="text-xs font-medium text-zinc-400">
            {media.releaseDate.substring(0, 4) ?? 'N/A'}
            <IconCircleFilled className="mx-1.5 mb-0.5 inline-block size-1.5" />
            {media.genres.map((genre) => genre.name).join(', ')}
          </p>

          <div className="space-y-1">
            <p className="line-clamp-3 text-xs leading-relaxed font-normal text-zinc-400">
              {media.overview}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-white/8 pt-3">
          <span className="text-[11px] font-medium text-zinc-400">
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
