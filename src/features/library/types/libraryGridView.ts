import { TrackedShow } from '@/features/show';
import { TrackedMovie } from '@/features/movie';
import { MediaType } from '@/types/media';

type LibraryItem =
  (TrackedShow & { itemType: MediaType }) | (TrackedMovie & { itemType: MediaType });

export type LibraryGridViewProps = {
  library: LibraryItem[];
};
