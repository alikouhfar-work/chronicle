import { FC } from 'react';
import { LibraryDetailsFooterProps } from '@/features/library/types/libraryDetailsFooter';
import Image from 'next/image';
import { getTmdbImageUrl } from '@/utils/getTmdbImageUrl';
import { createMonogram } from '@/utils/createMonogram';
import { getPosterPlaceholderColor } from '@/utils/getPosterPlaceholderColor';
import { LibraryMediaViewDetailsButton } from '@/features/library/components/LibraryMediaViewDetailsButton';
import { LibraryMediaTrackButton } from '@/features/library/components/LibraryMediaTrackButton';
import { IconChevronRight } from '@tabler/icons-react';
import Link from 'next/link';

export const LibraryDetailsFooter: FC<LibraryDetailsFooterProps> = ({ credits, similarMedia }) => {
  return (
    <div className="grid grid-cols-1 gap-6 border-t border-white/8 pt-4 lg:grid-cols-3">
      {/* Cast Members Column */}
      {credits && (
        <div className="space-y-3 lg:col-span-1">
          <div className="space-y-0.5">
            <h4 className="flex items-center gap-2 text-sm font-bold text-white">
              <span className="h-2 w-2 rounded-full bg-violet-400" />
              <span>Key Cast</span>
            </h4>
            <p className="text-xs text-zinc-400">Notable lead performances</p>
          </div>

          <ul className="glass-card space-y-1 rounded-2xl border border-white/8 p-2.5">
            {credits.cast.map((member) => (
              <li key={member.name}>
                <Link
                  href={`/person/${member.id}`}
                  className="group/cast flex cursor-pointer items-center justify-between rounded-xl border border-transparent px-2 py-1.5 transition-all select-none hover:border-white/10 hover:bg-white/8 active:bg-white/12"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="relative flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-zinc-800 text-xs font-bold text-zinc-200 transition-all group-hover/cast:border-violet-500/40 group-hover/cast:bg-violet-500/20 group-hover/cast:text-violet-300">
                      {member.profilePath ? (
                        <Image
                          fill
                          alt={member.name}
                          className="object-cover"
                          src={getTmdbImageUrl(member.profilePath, 'avatar', 'w300')!}
                        />
                      ) : (
                        createMonogram(member.name)
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-bold text-white transition-colors group-hover/cast:text-violet-300">
                        {member.name}
                      </p>
                      <p className="truncate text-[11px] text-zinc-400">{member.character}</p>
                    </div>
                  </div>
                  <div className="ml-2 flex shrink-0 items-center gap-1">
                    <IconChevronRight
                      size={14}
                      className="text-zinc-600 transition-all group-hover/cast:translate-x-0.5 group-hover/cast:text-violet-400"
                    />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* You Might Also Like Column */}
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
                <div
                  className={`absolute inset-0 bg-linear-to-br ${getPosterPlaceholderColor(similar.name)}`}
                />
                {similar.backdropPath && (
                  <Image
                    fill
                    alt={similar.name}
                    src={getTmdbImageUrl(similar.backdropPath, 'backdrop', 'w185')!}
                  />
                )}
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
    </div>
  );
};
