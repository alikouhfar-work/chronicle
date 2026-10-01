import { IconDeviceTv } from '@tabler/icons-react';
import { LibraryMediaSection } from '@/modules/library/components/LibraryMediaSection';
import { LibraryShowsProps } from '@/modules/library/types/libraryShows';
import { getTrackedShows } from '@/modules/show/queries/getTrackedShows';

export const LibraryShows = async ({ sort, status, search }: LibraryShowsProps) => {
  const shows = await getTrackedShows(sort, status, search);

  return (
    <LibraryMediaSection
      media={shows}
      mediaType="tv"
      icon={IconDeviceTv}
      emptyListTitle="No TV Shows Added Yet"
      emptyListSubtitle="Search and add television series in the Discover tab to start tracking episodes."
    />
  );
};
