import { IconDeviceTv } from '@tabler/icons-react';
import { LibrarySection } from '@/features/library/components/LibrarySection';
import { getTrackedShows } from '@/features/show';
import { LibraryShowsProps } from '@/features/library/types/libraryShows';

export const LibraryShows = async ({ sort, status, search }: LibraryShowsProps) => {
  const shows = await getTrackedShows(sort, status, search);

  return (
    <LibrarySection
      media={shows}
      mediaType="tv"
      icon={IconDeviceTv}
      emptyListTitle="No TV Shows Added Yet"
      emptyListSubtitle="Search and add television series in the Discover tab to start tracking episodes."
    />
  );
};
