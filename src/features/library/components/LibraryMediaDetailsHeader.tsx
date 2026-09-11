import { IconBook, IconDeviceTv, IconMovie, IconRefresh, IconStar } from '@tabler/icons-react';
import { FC } from 'react';
import { LibraryMediaDetailsHeaderProps } from '@/features/library/types/libraryItemHeader';
import { format } from 'date-fns';
import { getAverageEpisodeRuntime } from '@/features/show/utils/getAverageEpisodeRuntime';
import { getPosterPlaceholderColor } from '@/utils/getPosterPlaceholderColor';
import Image from 'next/image';
import { getTmdbImageUrl } from '@/utils/getTmdbImageUrl';
import { showStatusFilters } from '@/features/show/lib/statusFilters';
import { movieStatusFilters } from '@/features/movie/lib/statusFilters';
import { LibraryShowStatusChangeButton } from '@/features/library/components/LibraryShowStatusChangeButton';
import { LibraryMovieStatusChangeButton } from '@/features/library/components/LibraryMovieStatusChangeButton';

export const LibraryMediaDetailsHeader: FC<LibraryMediaDetailsHeaderProps> = ({ media }) => {
  const show = 'seasons' in media ? media : null;
  const movie = 'runtime' in media ? media : null;

  const runtime = show ? getAverageEpisodeRuntime(show) : movie?.runtime;

  return (
    <div className="glass-panel relative flex flex-col gap-7 overflow-hidden rounded-3xl border border-white/8 p-6 shadow-2xl md:flex-row md:p-8">
      {/* Decorative ambient glows inside hero */}
      <div className="pointer-events-none absolute top-0 right-1/4 h-80 w-80 rounded-full bg-violet-500/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-10 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl" />

      <div className="group relative aspect-2/3 w-full shrink-0 overflow-hidden rounded-2xl border border-white/15 shadow-2xl select-none md:w-56">
        <div
          className={`absolute inset-0 bg-linear-to-br ${getPosterPlaceholderColor(media.name)} flex flex-col justify-between p-4`}
        >
          {media.posterPath && (
            <Image
              fill
              alt={media.name}
              src={getTmdbImageUrl(media.posterPath, 'backdrop', 'w500')!}
            />
          )}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(139,92,246,0.15),transparent_50%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_35%,rgba(12,13,18,0.95)_100%)]" />
        </div>

        <div className="from-canvas via-canvas/60 to-canvas/10 absolute inset-0 z-0 bg-linear-to-t" />

        <div className="absolute inset-0 z-10 flex flex-col justify-between p-4">
          <div className="flex items-start justify-between gap-2">
            <span className="apple-badge border border-white/10 bg-black/60 text-[10px] text-zinc-300 backdrop-blur-md">
              {show ? (
                <IconDeviceTv size={10} className="mr-1 text-violet-400" />
              ) : (
                <IconMovie size={10} className="mr-1 text-violet-400" />
              )}
              <span>{show ? 'Series' : 'Movie'}</span>
            </span>
            <span className="rounded-full border border-white/10 bg-black/60 px-2 py-0.5 text-[10px] font-bold text-zinc-300 backdrop-blur-md">
              {show ? show.firstAirDate?.getFullYear() : movie?.releaseDate?.getFullYear()}
            </span>
          </div>

          <h3 className="text-base leading-tight font-bold text-white">{media.name}</h3>
        </div>
      </div>

      <div className="relative z-10 flex flex-1 flex-col justify-between space-y-5">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-baseline gap-2">
              <h2 className="text-2xl leading-tight font-extrabold tracking-tight text-white md:text-3xl">
                {media.name}
              </h2>
              <span className="text-sm font-semibold text-violet-400">
                (
                {show
                  ? `${show.firstAirDate?.getFullYear()}${show.firstAirDate?.getFullYear() !== show.lastAirDate?.getFullYear() ? `-${show.lastAirDate?.getFullYear()}` : ''}`
                  : movie?.releaseDate?.getFullYear()}
                )
              </span>
            </div>
            {media.tagline && (
              <p className="text-xs text-zinc-400 italic">&#34;{media.tagline}&#34;</p>
            )}
          </div>

          {/* Badges / Runtimes */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="apple-badge border border-white/10 bg-white/6 text-xs text-zinc-200">
              {show?.status || (movie?.runtime ? `${movie.runtime} min` : 'Released')}
            </span>
            {show && (
              <span className="apple-badge border border-white/10 bg-white/6 text-xs text-zinc-200">
                {runtime} {show ? 'min / ep' : 'min'}
              </span>
            )}
            {media.genres.map((genre) => (
              <span
                key={genre.id}
                className="apple-badge border border-violet-500/25 bg-violet-500/15 text-xs text-violet-300"
              >
                {genre.name}
              </span>
            ))}
            {show && (
              <span className="apple-badge flex items-center gap-1.5 border border-white/10 bg-white/6 text-xs text-zinc-300">
                <IconRefresh size={11} className="shrink-0 text-violet-400" />
                <span className="text-zinc-400">Synced:</span>
                <span className="font-semibold text-zinc-200">
                  {format(show.lastSyncedAt, "MMM d, yyyy 'at' h:mm a")}
                </span>
              </span>
            )}
          </div>

          {/* Synopsis */}
          <div className="space-y-1.5 pt-1">
            <h4 className="flex items-center gap-1.5 text-xs font-semibold text-violet-400">
              <IconBook size={13} className="text-violet-400" /> Overview
            </h4>
            <p className="text-xs leading-relaxed font-normal text-zinc-300 sm:text-sm">
              {media.overview}
            </p>
          </div>
        </div>

        {/* Controls Panel */}
        <div className="flex flex-col items-start justify-between gap-5 border-t border-white/8 pt-4 sm:flex-row sm:items-center">
          <div className="space-y-2">
            <p className="text-xs font-semibold text-zinc-400">Tracking Status</p>
            {show && (
              <div className="flex flex-wrap gap-1 rounded-[20px] border border-white/10 bg-zinc-900/90 p-1 sm:rounded-full">
                {showStatusFilters.map((statusFilter) => (
                  <LibraryShowStatusChangeButton
                    showId={show.id}
                    key={statusFilter.key}
                    statusFilter={statusFilter}
                    showStatus={show.tracking?.status}
                  />
                ))}
              </div>
            )}
            {movie && (
              <div className="flex flex-wrap gap-1 rounded-[20px] border border-white/10 bg-zinc-900/90 p-1 sm:rounded-full">
                {movieStatusFilters.map((statusFilter) => (
                  <LibraryMovieStatusChangeButton
                    movieId={movie?.id}
                    key={statusFilter.key}
                    statusFilter={statusFilter}
                    movieStatus={movie?.tracking?.status}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Movie Star rating */}
          {movie && movie.tracking?.status === 'COMPLETED' && (
            <div className="glass-card flex items-center gap-3 rounded-2xl border border-white/10 p-3 shadow-md">
              <div className="space-y-0.5">
                <p className="text-[10px] font-semibold tracking-tight text-zinc-400 uppercase">
                  Your Score
                </p>
                <div className="flex items-center gap-1 text-xs font-bold text-amber-400">
                  <IconStar className="fill-amber-400 text-amber-400" size={13} />
                  <span>{movie?.tracking.rating ? `${movie.tracking.rating} / 5` : 'Unrated'}</span>
                </div>
              </div>
              {/*<button*/}
              {/*  onClick={() => {*/}
              {/*    setMovieRating(movie?.rating || 0);*/}
              {/*    setMovieNotes(movie?.notes || '');*/}
              {/*    setIsEditingMovieLog(true);*/}
              {/*  }}*/}
              {/*  className="apple-pill-btn cursor-pointer bg-white/8 p-2 text-zinc-200 hover:bg-white/[0.15]"*/}
              {/*  title="Edit rating/review"*/}
              {/*>*/}
              {/*  <Edit3 size={13} />*/}
              {/*</button>*/}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
