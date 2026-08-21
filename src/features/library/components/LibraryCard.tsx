import Image from 'next/image';
import { getTmdbImageUrl } from '@/utils/getTmdbImageUrl';
import Link from 'next/link';
import { LibraryGridShowDeleteButton } from '@/features/library/components/LibraryGridShowDeleteButton';
import { IconDeviceTv } from '@tabler/icons-react';
import { showStatusConfig } from '@/features/show/lib/showStatusConfig';
import { LibraryShowProgress } from '@/features/library/components/LibraryShowProgress';
import { LibraryMovieRating } from '@/features/library/components/LibraryMovieRating';
import { LibraryCardProps } from '@/features/library/types/libraryCard';
import { FC } from 'react';
import { getPosterPlaceholderColor } from '@/utils/getPosterPlaceholderColor';

export const LibraryCard: FC<LibraryCardProps> = ({ media, mediaType }) => {
  const statusConfig = media.tracking?.status && showStatusConfig[media.tracking.status];
  const placeholderGradient = getPosterPlaceholderColor(media.name);

  return (
    <li className="group border-zinc-850/80 relative aspect-2/3 w-full cursor-pointer overflow-hidden rounded-2xl border shadow-lg transition-all duration-300 select-none hover:-translate-y-1 hover:border-zinc-700/80 hover:shadow-2xl hover:shadow-black/40">
      <Link href={`/library/${mediaType}/${media.tmdbId}`}>
        <div
          className={`absolute inset-0 bg-linear-to-br ${placeholderGradient} flex flex-col justify-between p-4 transition-transform duration-500 group-hover:scale-105`}
        >
          {media.posterPath && (
            <Image
              fill
              alt={media.name}
              src={getTmdbImageUrl(media.posterPath, 'backdrop', 'w500')!}
            />
          )}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.06),transparent_50%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_40%,rgba(0,0,0,0.85)_100%)]" />
          <div className="pointer-events-none absolute inset-0 bg-white/[0.01] bg-[radial-gradient(#ffffff03_1px,transparent_1px)] bg-size-[16px_16px]" />
        </div>

        <div className="absolute inset-0 bg-linear-to-t from-zinc-950 via-zinc-950/60 to-zinc-950/10 transition-all duration-300 group-hover:via-zinc-950/65" />

        <div className="absolute inset-0 z-10 flex flex-col justify-between p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start justify-between gap-2">
              <span className="border-zinc-850/80 flex items-center gap-1 rounded border bg-zinc-950/90 px-2 py-1 font-mono text-[8px] leading-none font-bold text-zinc-300 uppercase">
                <IconDeviceTv size={9} className="text-gold-400 -mt-0.5" />
                <span>Series</span>
              </span>
              {statusConfig && (
                <span
                  className={`flex items-center gap-1 rounded border px-2 py-1 font-mono text-[8px] leading-none font-bold uppercase ${statusConfig.colors}`}
                >
                  {statusConfig.title}
                </span>
              )}
            </div>

            <LibraryGridShowDeleteButton showId={media.id} />
          </div>

          <div className="space-y-3">
            <div className="space-y-1">
              <p className="text-gold-400 flex items-center gap-1.5 font-mono text-[9px] font-bold tracking-wider uppercase">
                <span className="bg-gold-400 h-1.5 w-1.5 rounded-full"></span>
                {'releaseDate' in media
                  ? media.releaseDate?.getFullYear()
                  : media.firstAirDate?.getFullYear()}
              </p>
              <h4
                className="group-hover:text-gold-200 line-clamp-2 font-serif text-base leading-tight font-black text-white drop-shadow-md transition-colors"
                title={media.name}
              >
                {media.name}
              </h4>
              {media.tagline && (
                <p className="line-clamp-1 text-[9.5px] font-light text-zinc-300 opacity-90 drop-shadow-sm">
                  {media.tagline}
                </p>
              )}
            </div>

            {media.genres && media.genres.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {media.genres.slice(0, 2).map((genre) => (
                  <span
                    key={genre.id}
                    className="rounded border border-zinc-900/40 bg-zinc-950/30 px-1.5 py-0.5 font-mono text-[8px] text-zinc-400"
                  >
                    {genre.name}
                  </span>
                ))}
              </div>
            )}

            {'seasons' in media && (
              <LibraryShowProgress
                seasons={media.seasons}
                numberOfEpisodes={media.numberOfEpisodes}
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
