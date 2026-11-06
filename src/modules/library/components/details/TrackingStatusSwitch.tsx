import type { TrackedMedia } from '@/modules/library/types/trackedMedia';
import type { TrackedShow } from '@/modules/show';
import { showStatusFilters } from '@/modules/show/lib/statusFilters';
import { movieStatusFilters } from '@/modules/movie/lib/statusFilters';
import { LibraryShowStatusChangeButton } from '@/modules/library/components/shows/LibraryShowStatusChangeButton';
import { LibraryMovieStatusChangeButton } from '@/modules/library/components/movies/LibraryMovieStatusChangeButton';
import type { TrackingStatusSwitchProps } from '@/modules/library/types/trackingStatusSwitch';

const isShow = (media: TrackedMedia): media is TrackedShow => 'seasons' in media;

export const TrackingStatusSwitch = ({ media }: TrackingStatusSwitchProps) => (
  <div className="w-full min-w-0 space-y-2 sm:w-auto">
    <p className="text-xs font-semibold text-ink-muted">Tracking Status</p>
    {isShow(media) ? (
      <div className="flex max-w-full min-w-0 flex-wrap gap-1 rounded-[20px] border border-line bg-surface-raised/90 p-1 sm:rounded-pill">
        {showStatusFilters.map((statusFilter) => (
          <LibraryShowStatusChangeButton
            showId={media.id}
            key={statusFilter.key}
            statusFilter={statusFilter}
            showStatus={media.tracking?.status}
          />
        ))}
      </div>
    ) : (
      <div className="flex max-w-full min-w-0 flex-wrap gap-1 rounded-[20px] border border-line bg-surface-raised/90 p-1 sm:rounded-pill">
        {movieStatusFilters.map((statusFilter) => (
          <LibraryMovieStatusChangeButton
            movieId={media.id}
            key={statusFilter.key}
            statusFilter={statusFilter}
            movieStatus={media.tracking?.status}
          />
        ))}
      </div>
    )}
  </div>
);
