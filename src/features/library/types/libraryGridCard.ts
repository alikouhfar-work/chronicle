import { TrackedShow } from '@/features/show';
import { TrackedMovie } from '@/features/movie';
import { MediaType } from '@/types/media';

export type LibraryItem =
  (TrackedShow & { itemType: MediaType }) | (TrackedMovie & { itemType: MediaType });

export type LibraryGridCardProps = {
  libraryItem: LibraryItem;
};
