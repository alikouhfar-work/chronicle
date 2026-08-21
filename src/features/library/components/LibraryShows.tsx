import { IconDeviceTv } from '@tabler/icons-react';
import { LibrarySection } from '@/features/library/components/LibrarySection';
import { getTrackedShows } from '@/features/show';
import { LibraryShowsProps } from '@/features/library/types/libraryShows';

export const LibraryShows = async ({ sort, status }: LibraryShowsProps) => {
  const shows = await getTrackedShows(sort, status);

  return (
    <LibrarySection
      media={shows}
      mediaType="tv"
      icon={IconDeviceTv}
      emptyMessage="No TV Series found matching the current filter."
    />
  );
};
