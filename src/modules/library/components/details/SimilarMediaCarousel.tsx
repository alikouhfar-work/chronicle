import { LibraryMediaViewDetailsButton } from '@/modules/library/components/LibraryMediaViewDetailsButton';
import { LibraryMediaTrackButton } from '@/modules/library/components/LibraryMediaTrackButton';
import { MediaPosterImage } from '@/shared/ui/MediaPosterImage';
import type { SimilarMediaCarouselProps } from '@/modules/library/types/similarMediaCarousel';

export const SimilarMediaCarousel = ({ similarMedia }: SimilarMediaCarouselProps) => {
  return (
    <div className="space-y-3 lg:col-span-2">
      <div className="space-y-0.5">
        <h4 className="flex items-center gap-2 text-sm font-bold text-white">
          <span className="h-2 w-2 rounded-full bg-violet-400" />
          <span>Recommended For You</span>
        </h4>
        <p className="text-xs text-zinc-400">Titles with similar themes and tone</p>
      </div>

      <ul className="-mx-1 flex snap-x snap-mandatory scrollbar-thin scrollbar-thumb-white/15 scrollbar-track-transparent gap-5 overflow-x-auto scroll-smooth px-1 pt-1.5 pb-4">
        {similarMedia.map((similar) => (
          <li
            key={similar.id}
            className="group/sim glass-card flex min-w-52.5 flex-col justify-between overflow-hidden rounded-2xl border border-white/8 shadow-lg transition-all duration-200 hover:scale-[1.02]"
          >
            <div className="relative h-24 w-full shrink-0 overflow-hidden border-b border-white/8 select-none">
              <MediaPosterImage
                title={similar.name}
                path={similar.backdropPath}
                alt={similar.name}
                size="w185"
              />
              <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_25%,rgba(12,13,18,0.95)_100%)]" />

              <div className="absolute inset-0 z-10 flex flex-col justify-between p-2.5">
                <div className="flex items-start justify-between gap-2">
                  <span className="apple-badge border border-white/10 bg-black/60 text-[9px] text-zinc-300 backdrop-blur-md">
                    {similar.mediaType === 'tv' ? 'Series' : 'Film'}
                  </span>
                  <span className="rounded-full border border-white/10 bg-black/60 px-1.5 py-0.5 text-[9px] font-bold text-zinc-300 backdrop-blur-md">
                    {similar.releaseDate.substring(0, 4) ?? 'N/A'}
                  </span>
                </div>

                <h5 className="truncate text-xs font-bold text-white transition-colors group-hover/sim:text-violet-300">
                  {similar.name}
                </h5>
              </div>
            </div>

            <div className="flex flex-1 flex-col justify-between gap-3 p-3">
              <p className="line-clamp-3 text-xs leading-relaxed font-normal text-zinc-400">
                {similar.overview}
              </p>

              <div className="border-t border-white/8 pt-4">
                {similar.isTracked ? (
                  <LibraryMediaViewDetailsButton
                    tmdbId={similar.id}
                    mediaType={similar.mediaType}
                    className="w-full"
                  />
                ) : (
                  <LibraryMediaTrackButton
                    tmdbId={similar.id}
                    mediaType={similar.mediaType}
                    className="w-full"
                  />
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
