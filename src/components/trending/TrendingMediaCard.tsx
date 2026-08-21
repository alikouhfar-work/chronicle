import Image from 'next/image';
import { getTmdbImageUrl } from '@/utils/getTmdbImageUrl';
import { getPosterPlaceholderColor } from '@/app/(main)/(dashboard)/_utils/getPosterPlaceholderColor';
import { IconStarFilled } from '@tabler/icons-react';
import { FC } from 'react';
import { TrendingMediaCardProps } from '@/app/(main)/(dashboard)/_types/trending';
import { TrackButton } from '@/features/library/components/TrackButton';

export const TrendingMediaCard: FC<TrendingMediaCardProps> = ({ media }) => {
  const isTracked = false;

  return (
    <li className="group border-zinc-850 hover:border-zinc-750/80 relative flex min-w-70 flex-col justify-between overflow-hidden rounded-2xl border bg-zinc-900/40 shadow-md transition-all duration-300 hover:bg-zinc-900/90">
      <div className="border-zinc-850/50 relative aspect-video w-full shrink-0 overflow-hidden border-b select-none">
        {media.backdropPath ? (
          <Image
            fill
            alt={media.title}
            src={getTmdbImageUrl(media.backdropPath, 'backdrop', 'w300')!}
          />
        ) : (
          <div
            className={`absolute inset-0 bg-gradient-to-br ${getPosterPlaceholderColor(media.title)}`}
          />
        )}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.05),transparent_50%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_25%,rgba(9,9,11,0.95)_100%)]" />
        <div className="absolute inset-0 bg-zinc-950/20" />
        <div className="absolute inset-0 bg-white/[0.01] bg-[radial-gradient(#ffffff02_1px,transparent_1px)] [background-size:10px_10px]" />

        {/* Content overlays on mini cover banner */}
        <div className="absolute inset-0 z-10 flex flex-col justify-between p-4.5">
          <div className="bg-gold-400/30 text-gold-400 border-gold-400/50 ml-auto flex items-center gap-1 rounded border px-1.5 py-0.5 font-mono text-[8px] leading-none font-bold">
            <IconStarFilled className="size-1.5" />
            <span>{media.rating.toFixed(1)}</span>
          </div>

          <h4 className="group-hover:text-gold-300 truncate font-serif text-sm leading-tight font-black text-white drop-shadow-md transition-colors">
            {media.title}
          </h4>
        </div>
      </div>

      {/* Card Content & Action Button */}
      <div className="flex flex-1 flex-col justify-between gap-4 p-5">
        <div className="space-y-3">
          <p className="font-mono text-[8.5px] leading-none font-semibold tracking-wider text-zinc-500 uppercase">
            {media.firstAirYear} • {media.genres.join(', ')}
          </p>

          <div className="space-y-1.5">
            {/*{media.tagline && (*/}
            {/*  <p className="text-gold-400/80 text-[9.5px] leading-none font-medium italic">*/}
            {/*    {media.tagline}*/}
            {/*  </p>*/}
            {/*)}*/}
            <p className="line-clamp-3 font-sans text-[11px] leading-relaxed font-light text-zinc-400">
              {media.overview}
            </p>
          </div>
        </div>

        <div className="border-zinc-850/40 flex items-center justify-between gap-2 border-t bg-transparent pt-3">
          <span className="font-mono text-[9px] tracking-wider text-zinc-500 uppercase">
            {new Intl.NumberFormat('en-US', {
              notation: 'compact',
              compactDisplay: 'short',
            }).format(media.voteCount)}{' '}
            votes
          </span>

          {isTracked ? (
            <button
              // onClick={() => onSelectMovie(trackedMatch as TrackedMovie)}
              onClick={() => console.log('Track Movie')}
              className="hover:bg-zinc-750 text-gold-400 hover:text-gold-300 cursor-pointer rounded-lg border border-zinc-700/50 bg-zinc-800 px-3 py-1.5 font-mono text-[10px] font-bold tracking-wider uppercase transition-colors"
            >
              View details
            </button>
          ) : (
            <TrackButton tmdbId={media.id} mediaType={media.mediaType} />
          )}
        </div>
      </div>
    </li>
  );
};
