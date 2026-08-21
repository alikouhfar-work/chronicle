'use client';

import { IconBook, IconDeviceTv, IconRefresh, IconVideo } from '@tabler/icons-react';
import { FC, useTransition } from 'react';
import { LibraryMediaDetailsHeaderProps } from '@/features/library/types/libraryItemHeader';
import Image from 'next/image';
import { getTmdbImageUrl } from '@/utils/getTmdbImageUrl';
import { showStatusFilters } from '@/features/show/lib/statusFilters';
import { updateShowTrackingStatus } from '@/features/show/actions/updateShowTrackingStatus';
import { clsx } from 'clsx';
import { MovieTrackingStatus, ShowTrackingStatus } from '../../../../generated/prisma/enums';
import { format } from 'date-fns';
import { getAverageEpisodeRuntime } from '@/features/show/utils/getAverageEpisodeRuntime';
import { getPosterPlaceholderColor } from '@/utils/getPosterPlaceholderColor';
import { movieStatusFilters } from '@/features/movie/lib/statusFilters';
import { updateMovieTrackingStatus } from '@/features/movie/actions/updateMovieTrackingStatus';

export const LibraryMediaDetailsHeader: FC<LibraryMediaDetailsHeaderProps> = ({ media }) => {
  const [isPending, startTransition] = useTransition();
  const show = 'seasons' in media ? media : null;
  const movie = 'runtime' in media ? media : null;

  const runtime = show ? getAverageEpisodeRuntime(show) : movie?.runtime;

  const handleShowStatusChange = (status: ShowTrackingStatus) => {
    if (!show) return;
    startTransition(async () => {
      await updateShowTrackingStatus(show.id, status);
    });

    // Add Toast
  };

  const handleMovieStatusChange = (status: MovieTrackingStatus) => {
    if (!movie) return;
    startTransition(async () => {
      await updateMovieTrackingStatus(movie.id, status);
    });

    // Add Toast
  };

  return (
    <div className="border-zinc-850/80 relative flex flex-col gap-8 overflow-hidden rounded-2xl border bg-zinc-900/50 p-6 shadow-xl backdrop-blur-md md:flex-row md:p-8">
      {/* Decorative ambient glows inside hero */}
      <div className="bg-gold-500/5 pointer-events-none absolute -top-16 -right-16 h-36 w-36 rounded-full blur-3xl" />
      <div className="bg-gold-500/5 pointer-events-none absolute -bottom-16 -left-16 h-36 w-36 rounded-full blur-3xl" />

      {/* Poster representation (aligned with cover-art style) */}
      <div
        className={`group relative aspect-2/3 w-full shrink-0 overflow-hidden rounded-2xl border border-zinc-800/80 shadow-lg select-none md:w-56`}
      >
        <div
          className={`absolute inset-0 bg-linear-to-br ${getPosterPlaceholderColor(media.name)} flex flex-col justify-between p-5`}
        >
          {media.posterPath && (
            <Image
              fill
              alt={media.name}
              src={getTmdbImageUrl(media.posterPath, 'backdrop', 'w500')!}
            />
          )}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.06),transparent_50%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_45%,rgba(0,0,0,0.9)_100%)]" />
          <div className="pointer-events-none absolute inset-0 bg-white/[0.01] bg-[radial-gradient(#ffffff02_1px,transparent_1px)] [background-size:14px_14px]" />
        </div>

        {/* Dark overlay */}
        <div className="absolute inset-0 z-0 bg-linear-to-t from-zinc-950 via-zinc-950/70 to-zinc-950/10" />

        {/* Additional details on top of cover */}
        <div className="absolute inset-0 z-10 flex flex-col justify-between p-5">
          <div className="flex items-start justify-between gap-2">
            <span className="border-zinc-850/80 flex items-center gap-1 rounded border bg-zinc-950/90 px-2 py-1 font-mono text-[8px] leading-none font-bold text-zinc-300 uppercase">
              {show ? (
                <IconDeviceTv size={9} className="text-gold-400" />
              ) : (
                <IconVideo size={9} className="text-gold-400" />
              )}
              <span>{show ? 'Series' : 'Movie'}</span>
            </span>
          </div>

          <h3 className="font-serif text-base leading-tight font-black text-white drop-shadow-md">
            {media.name}
          </h3>
        </div>
      </div>

      {/* Info Grid details */}
      <div className="relative z-10 flex flex-1 flex-col justify-between space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-baseline gap-2">
              <h2 className="font-serif text-2xl leading-tight font-black tracking-tight text-white md:text-3xl">
                {media.name}
              </h2>
              <p className="flex items-center font-mono text-sm text-zinc-500">
                (
                {show ? (
                  <span className="flex items-center">
                    {show.firstAirDate?.getFullYear()} - {show.lastAirDate?.getFullYear()}
                  </span>
                ) : (
                  <span>{movie?.releaseDate?.getFullYear()}</span>
                )}
                )
              </p>
            </div>
            {media.tagline && (
              <p className="text-gold-400 text-sm font-light italic">&#34;{media.tagline}&#34;</p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {runtime && (
              <span className="rounded-lg border border-zinc-800/80 bg-zinc-950/80 px-3 py-1 font-mono text-[9px] tracking-widest text-zinc-300 uppercase">
                {runtime} {show ? 'min / ep' : 'min'}
              </span>
            )}
            {media.genres.map((genre) => (
              <span
                key={genre.id}
                className="bg-gold-400/5 text-gold-400 border-gold-400/10 rounded-lg border px-3 py-1 font-mono text-[9px] tracking-widest uppercase"
              >
                {genre.name}
              </span>
            ))}
            {show && show.lastSyncedAt && (
              <span className="flex items-center gap-1.5 rounded-lg border border-emerald-500/20 bg-zinc-950/80 px-3 py-1 font-mono text-[9px] tracking-widest text-emerald-400 uppercase shadow-sm">
                <IconRefresh size={10} className="shrink-0 text-emerald-400" />
                <span className="text-zinc-400">Synced:</span>
                <span className="font-bold text-emerald-300">
                  {format(show.lastSyncedAt, "MMM d, yyyy 'at' h:mm a")}
                </span>
              </span>
            )}
          </div>

          <div className="space-y-2 pt-2">
            <h4 className="flex items-center gap-1.5 font-mono text-[9px] font-bold tracking-widest text-zinc-500 uppercase">
              <IconBook size={11} className="text-gold-400" /> Overview
            </h4>
            <p className="text-sm leading-relaxed font-light text-zinc-300">{media.overview}</p>
          </div>
        </div>

        {/* Controls Panel */}
        <div className="border-zinc-850/60 flex flex-col items-start justify-between gap-6 border-t pt-6 sm:flex-row sm:items-center">
          <div className="space-y-2.5">
            <p className="font-mono text-[9px] font-bold tracking-widest text-zinc-500 uppercase">
              Track Status
            </p>
            {show && (
              <div className="border-zinc-850 flex flex-wrap gap-1 rounded-xl border bg-zinc-950/80 p-1">
                {showStatusFilters.map((status) => {
                  const automatic =
                    status.key === ShowTrackingStatus.WATCHING ||
                    status.key === ShowTrackingStatus.COMPLETED;

                  return (
                    <button
                      key={status.key}
                      disabled={automatic || isPending}
                      onClick={() => !automatic && handleShowStatusChange(status.key)}
                      className={clsx(
                        'rounded-lg px-3.5 py-1.5 font-mono text-[9.5px] tracking-wider uppercase transition-all duration-300',
                        automatic ? 'cursor-not-allowed' : 'cursor-pointer',
                        !automatic && 'hover:text-zinc-200',
                        show.tracking?.status === status.key
                          ? 'bg-gold-400 font-bold text-zinc-950 shadow'
                          : 'text-zinc-400 hover:bg-zinc-900/40',
                      )}
                    >
                      {status.title}
                    </button>
                  );
                })}
              </div>
            )}
            {movie && (
              <div className="border-zinc-850 flex flex-wrap gap-1 rounded-xl border bg-zinc-950/80 p-1">
                {movieStatusFilters.map((status) => (
                  <button
                    key={status.key}
                    disabled={isPending}
                    onClick={() => handleMovieStatusChange(status.key)}
                    className={clsx(
                      'cursor-pointer rounded-lg px-3.5 py-1.5 font-mono text-[9.5px] tracking-wider uppercase transition-all duration-300',
                      movie.tracking?.status === status.key
                        ? 'bg-gold-400 font-bold text-zinc-950 shadow'
                        : 'text-zinc-400 hover:bg-zinc-900/40',
                    )}
                  >
                    {status.title}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
