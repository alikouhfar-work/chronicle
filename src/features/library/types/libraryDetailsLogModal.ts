import { ReactNode } from 'react';
import { LibraryDetailsLogAction } from '@/features/library/types/libraryDetailsLog';

export type LibraryDetailsLogModalProps = {
  icon: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  /** Hidden inputs merged into the form, e.g. `{ movieId }` or `{ episodeId }`. */
  hiddenFields: Record<string, string>;
  initialRating: number;
  initialNotes: string;
  action: LibraryDetailsLogAction;
  onClose: () => void;
};
