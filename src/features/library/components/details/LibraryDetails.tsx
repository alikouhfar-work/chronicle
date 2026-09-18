import { FC } from 'react';
import { LibraryDetailsHeader } from '@/features/library/components/details/LibraryDetailsHeader';
import { LibraryShowDetailsProps } from '@/features/library/types/libraryDetails';
import { LibraryDetailsSeasons } from '@/features/library/components/details/LibraryDetailsSeasons';
import { LibraryDetailsFooter } from '@/features/library/components/details/LibraryDetailsFooter';
import { LibraryDetailsMovieLog } from '@/features/library/components/details/LibraryDetailsMovieLog';

export const LibraryDetails: FC<LibraryShowDetailsProps> = ({
  media,
  mediaType,
  credits,
  similarMedia,
}) => {
  return (
    <section className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-y-8 font-sans">
      <LibraryDetailsHeader media={media} />
      {mediaType === 'movie' && <LibraryDetailsMovieLog movie={media} />}
      {mediaType === 'tv' && <LibraryDetailsSeasons show={media} />}
      <LibraryDetailsFooter credits={credits} similarMedia={similarMedia} />
    </section>
  );
};
