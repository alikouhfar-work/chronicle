import { LibraryDetailsHeader } from '@/modules/library/components/details/LibraryDetailsHeader';
import { LibraryShowDetailsProps } from '@/modules/library/types/libraryDetails';
import { LibraryDetailsSeasons } from '@/modules/library/components/details/LibraryDetailsSeasons';
import { LibraryDetailsFooter } from '@/modules/library/components/details/LibraryDetailsFooter';
import { LibraryDetailsMovieLog } from '@/modules/library/components/details/LibraryDetailsMovieLog';
import { LibraryDetailsShowWatchToggle } from '@/modules/library/components/details/LibraryDetailsShowWatchToggle';
import { LibraryDetailsNavigation } from '@/modules/library/components/details/LibraryDetailsNavigation';
import { LibraryDetailsActionsMenu } from '@/modules/library/components/details/LibraryDetailsActionsMenu';
import { LibraryDetailsShareButton } from '@/modules/library/components/details/LibraryDetailsShareButton';

export const LibraryDetails = ({
  media,
  mediaType,
  credits,
  similarMedia,
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

  return (
    <section className="mx-auto flex w-full min-w-0 max-w-7xl flex-1 flex-col gap-y-8 font-sans">
      <LibraryDetailsNavigation
        actions={
          // Mobile: the actions menu lives at the top-right end of the back
          // row, where its right-aligned dropdown has room to open inside the
          // viewport. (On sm+ screens it stays in the header controls.)
          <div className="sm:hidden">
            <LibraryDetailsActionsMenu
              extraActions={showWatchToggle}
              shareButton={shareButton}
            />
          </div>
        }
      />
      <LibraryDetailsHeader
        media={media}
        mediaType={mediaType}
        credits={credits}
        extraActions={showWatchToggle}
      />
      {mediaType === 'movie' && <LibraryDetailsMovieLog movie={media} />}
      {mediaType === 'tv' && <LibraryDetailsSeasons show={media} />}
      <LibraryDetailsFooter credits={credits} similarMedia={similarMedia} />
    </section>
  );
};
