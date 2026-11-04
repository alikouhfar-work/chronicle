import { Suspense } from 'react';
import { LibraryDetailsHeader } from '@/modules/library/components/details/LibraryDetailsHeader';
import { LibraryShowDetailsProps } from '@/modules/library/types/libraryDetails';
import { LibraryDetailsSeasons } from '@/modules/library/components/details/LibraryDetailsSeasons';
import { LibraryDetailsFooter } from '@/modules/library/components/details/LibraryDetailsFooter';
import { LibraryDetailsShowWatchToggle } from '@/modules/library/components/details/LibraryDetailsShowWatchToggle';
import { LibraryDetailsNavigation } from '@/modules/library/components/details/LibraryDetailsNavigation';
import { LibraryDetailsActionsMenu } from '@/modules/library/components/details/LibraryDetailsActionsMenu';
import { LibraryDetailsShareButton } from '@/modules/library/components/details/LibraryDetailsShareButton';
import { RewatchButton } from '@/modules/rewatch';
import { MediaCommentTabs } from '@/modules/comments/components/MediaCommentTabs';
import { MediaCommentTabsSkeleton } from '@/modules/comments/components/MediaCommentTabsSkeleton';

export const LibraryDetails = ({
  media,
  mediaType,
  credits,
  similarMedia,
  viewer,
  initialNotes,
  initialReviews,
}: LibraryShowDetailsProps) => {
  const showWatchToggle =
    mediaType === 'tv' ? (
      <LibraryDetailsShowWatchToggle
        showId={media.id}
        seriesWatched={media.tracking?.status === 'COMPLETED'}
      />
    ) : undefined;
  const shareButton = (
    <LibraryDetailsShareButton media={media} mediaType={mediaType} credits={credits} />
  );
  const menuActions = (
    <>
      <RewatchButton
        mediaType={mediaType === 'tv' ? 'show' : 'movie'}
        mediaId={media.id}
        initialCount={media.rewatchCount}
        historyTitle={media.name}
        fullWidth
      />
      {showWatchToggle}
    </>
  );

  // Ratings are owned by the Movie/Episode tracking row and are rendered
  // inside the Personal tab, next to (not merged with) the note list.
  const personalNotes =
    mediaType === 'movie'
      ? {
          rating: media.tracking?.rating ?? null,
          ratingTargetId: media.id,
        }
      : {
          rating: null,
          ratingTargetId: null,
          trackingStatus: media.tracking?.status ?? null,
          rewatchCount: media.rewatchCount,
        };

  return (
    <section className="mx-auto flex w-full max-w-7xl min-w-0 flex-1 flex-col gap-y-8 font-sans">
      <LibraryDetailsNavigation
        actions={
          // Mobile: the actions menu lives at the top-right end of the back
          // row, where its right-aligned dropdown has room to open inside the
          // viewport. (On sm+ screens it stays in the header controls.)
          <div className="sm:hidden">
            <LibraryDetailsActionsMenu extraActions={menuActions} shareButton={shareButton} />
          </div>
        }
      />
      <LibraryDetailsHeader
        media={media}
        mediaType={mediaType}
        credits={credits}
        extraActions={menuActions}
      />
      {mediaType === 'tv' && <LibraryDetailsSeasons show={media} />}
      <Suspense fallback={<MediaCommentTabsSkeleton />}>
        <MediaCommentTabs
          mediaType={mediaType === 'tv' ? 'show' : 'movie'}
          tmdbId={media.tmdbId}
          personalNotes={personalNotes}
          viewer={viewer}
          initialNotes={initialNotes}
          initialReviews={initialReviews}
        />
      </Suspense>
      <LibraryDetailsFooter credits={credits} similarMedia={similarMedia} />
    </section>
  );
};
