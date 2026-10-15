import { LibraryDetailsHeader } from '@/modules/library/components/details/LibraryDetailsHeader';
import { LibraryShowDetailsProps } from '@/modules/library/types/libraryDetails';
import { LibraryDetailsSeasons } from '@/modules/library/components/details/LibraryDetailsSeasons';
import { LibraryDetailsFooter } from '@/modules/library/components/details/LibraryDetailsFooter';
import { LibraryDetailsMovieLog } from '@/modules/library/components/details/LibraryDetailsMovieLog';
import { LibraryDetailsShowWatchToggle } from '@/modules/library/components/details/LibraryDetailsShowWatchToggle';

export const LibraryDetails = ({
  media,
  mediaType,
  credits,
  similarMedia,
}: LibraryShowDetailsProps) => {
  return (
    <section className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-y-8 font-sans">
      <LibraryDetailsHeader
        media={media}
        mediaType={mediaType}
        credits={credits}
        extraActions={
          mediaType === 'tv' ? (
            <LibraryDetailsShowWatchToggle
              showId={media.id}
              seriesWatched={media.tracking?.status === 'COMPLETED'}
            />
          ) : undefined
        }
      />
      {mediaType === 'movie' && <LibraryDetailsMovieLog movie={media} />}
      {mediaType === 'tv' && <LibraryDetailsSeasons show={media} />}
      <LibraryDetailsFooter credits={credits} similarMedia={similarMedia} />
    </section>
  );
};
