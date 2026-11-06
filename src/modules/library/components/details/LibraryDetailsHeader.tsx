import { IconBook, IconDeviceTv, IconMovie, IconRefresh } from '@tabler/icons-react';
import type { LibraryDetailsHeaderProps } from '@/modules/library/types/libraryDetailsHeader';
import { format } from 'date-fns';
import { getAverageEpisodeRuntime } from '@/modules/show/utils/getAverageEpisodeRuntime';
import { MediaPosterImage } from '@/shared/ui/MediaPosterImage';
import { TrackingStatusSwitch } from '@/modules/library/components/details/TrackingStatusSwitch';
import { ShowLifecycleBadge } from '@/modules/library/components/details/ShowLifecycleBadge';
import { LibraryDetailsShareButton } from '@/modules/library/components/details/LibraryDetailsShareButton';
import { LibraryDetailsActionsMenu } from '@/modules/library/components/details/LibraryDetailsActionsMenu';
import { RatingControl } from '@/modules/notes/components/RatingControl';

export const LibraryDetailsHeader = ({
  media,
  mediaType,
  credits,
  controls,
  extraActions,
}: LibraryDetailsHeaderProps) => {
  const show = 'seasons' in media ? media : null;
  const movie = 'runtime' in media ? media : null;

  const runtime = show ? getAverageEpisodeRuntime(show) : movie?.runtime;

  // overflow-visible so the actions-menu dropdown can extend past the panel
  return (
    <div className="glass-panel relative flex flex-col gap-7 overflow-visible rounded-card border border-line p-6 shadow-2xl md:flex-row md:p-8">
      {/* Decorative ambient glows inside hero */}
      <div className="pointer-events-none absolute top-0 right-1/4 h-80 w-80 rounded-pill bg-accent-bright/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-10 h-72 w-72 rounded-pill bg-info-soft blur-3xl" />

      <div className="group relative mx-auto aspect-2/3 w-full max-w-65 shrink-0 overflow-hidden rounded-card border border-line shadow-2xl select-none sm:max-w-72 md:mx-0 md:w-56 md:max-w-none">
        <MediaPosterImage title={media.name} path={media.posterPath} alt={media.name} size="w500" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(139,92,246,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_35%,rgba(12,13,18,0.95)_100%)]" />

        <div className="from-canvas via-canvas/60 to-canvas/10 absolute inset-0 z-0 bg-linear-to-t" />

        <div className="absolute inset-0 z-10 flex flex-col justify-between p-4">
          <div className="flex items-start justify-between gap-2">
            <span className="apple-badge border border-line bg-black/60 text-micro text-ink-secondary backdrop-blur-md">
              {show ? (
                <IconDeviceTv size={10} className="mr-1 text-accent-ink" />
              ) : (
                <IconMovie size={10} className="mr-1 text-accent-ink" />
              )}
              <span>{show ? 'Series' : 'Movie'}</span>
            </span>
            <span className="rounded-pill border border-line bg-black/60 px-2 py-0.5 text-micro font-bold text-ink-secondary backdrop-blur-md">
              {show ? show.firstAirDate?.getFullYear() : movie?.releaseDate?.getFullYear()}
            </span>
          </div>

          <h3 className="text-base leading-tight font-bold text-ink">{media.name}</h3>
        </div>
      </div>

      <div className="relative z-10 flex w-full min-w-0 flex-1 flex-col justify-between space-y-5">
        <div className="space-y-4">
          <div className="min-w-0 space-y-1.5">
            <div className="flex min-w-0 flex-wrap items-baseline gap-2">
              <h2 className="min-w-0 text-2xl leading-tight font-extrabold tracking-tight break-words text-ink md:text-3xl">
                {media.name}
              </h2>
              <span className="text-sm font-semibold text-accent-ink">
                (
                {show
                  ? `${show.firstAirDate?.getFullYear()}${
                      show.lastAirDate &&
                      show.firstAirDate?.getFullYear() !== show.lastAirDate.getFullYear()
                        ? `-${show.lastAirDate.getFullYear()}`
                        : ''
                    }`
                  : movie?.releaseDate?.getFullYear()}
                )
              </span>
            </div>
            {media.tagline && (
              <p className="text-xs text-ink-muted italic">&#34;{media.tagline}&#34;</p>
            )}
          </div>

          {/* Badges / Runtimes */}
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            {show ? (
              <ShowLifecycleBadge status={show.status} inProduction={show.inProduction} />
            ) : (
              <span className="apple-badge border border-line bg-surface-soft text-xs text-ink-secondary">
                {movie?.runtime ? `${movie.runtime} min` : 'Released'}
              </span>
            )}
            {show && (
              <span className="apple-badge border border-line bg-surface-soft text-xs text-ink-secondary">
                {runtime} {show ? 'min / ep' : 'min'}
              </span>
            )}
            {media.genres.map((genre) => (
              <span
                key={genre.id}
                className="apple-badge border border-accent-line bg-accent-bright/15 text-xs text-accent-ink"
              >
                {genre.name}
              </span>
            ))}
            {show && (
              <span className="apple-badge flex max-w-full min-w-0 items-center gap-1.5 border border-line bg-surface-soft text-xs break-words text-ink-secondary">
                <IconRefresh size={11} className="shrink-0 text-accent-ink" />
                <span className="shrink-0 text-ink-muted">Synced:</span>
                <span className="min-w-0 font-semibold break-words text-ink-secondary">
                  {format(show.lastSyncedAt, "MMM d, yyyy 'at' h:mm a")}
                </span>
              </span>
            )}
          </div>

          {/* Synopsis */}
          <div className="space-y-1.5 pt-1">
            <h4 className="flex items-center gap-1.5 text-xs font-semibold text-accent-ink">
              <IconBook size={13} className="text-accent-ink" /> Overview
            </h4>
            <p className="min-w-0 text-xs leading-relaxed font-normal break-words text-ink-secondary sm:text-sm">
              {media.overview}
            </p>
          </div>
        </div>

        {/* Controls Panel */}
        <div className="flex w-full min-w-0 flex-col items-start justify-between gap-5 border-t border-line pt-4 sm:flex-row sm:items-end">
          {controls ?? <TrackingStatusSwitch media={media} />}

          <div className="flex w-full min-w-0 flex-wrap items-center gap-3 sm:w-auto">
            {movie && (
              <div className="glass-card rounded-card border border-line p-3 shadow-card">
                {/* Rating is episode/film only (D1) and belongs in the header,
                    not behind the notes tab — same action, no new endpoint. */}
                <RatingControl
                  mediaType="movie"
                  targetId={movie.id}
                  value={movie.tracking?.rating ?? null}
                  label="Rate this movie"
                  variant="compact"
                />
              </div>
            )}
            {/* Desktop: actions stay in the header controls. On mobile the
                menu lives at the top-right end of the back row (see
                LibraryDetails), where its dropdown fits the viewport. */}
            <div className="hidden sm:block">
              <LibraryDetailsActionsMenu
                extraActions={extraActions}
                shareButton={
                  <LibraryDetailsShareButton media={media} mediaType={mediaType} credits={credits} />
                }
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
