'use client';

import { IconTrash } from '@tabler/icons-react';
import { deleteShowFromLibrary } from '@/modules/show/actions/deleteShowFromLibrary';
import { LibraryMediaDeleteButtonProps } from '@/modules/library/types/libraryMediaDeleteButton';
import { deleteMovieFromLibrary } from '@/modules/movie/actions/deleteMovieFromLibrary';
import { useServerAction } from '@/shared/hooks/useServerAction';
import { ActionButton } from '@/shared/ui/ActionButton';

export const LibraryMediaDeleteButton = ({
  mediaId,
  mediaType,
}: LibraryMediaDeleteButtonProps) => {
  const isSeries = mediaType === 'tv';
  const { execute: removeMedia, isPending } = useServerAction(
    isSeries ? deleteShowFromLibrary : deleteMovieFromLibrary,
    {
      successMessage: isSeries ? 'Series deleted from library' : 'Movie deleted from library',
      errorMessage: 'Couldn’t delete this title. Please try again.',
    },
  );

  return (
    <ActionButton
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        removeMedia(mediaId);
      }}
      isPending={isPending}
      icon={<IconTrash size={12} strokeWidth={2.6} />}
      aria-label="Remove from library"
      title="Remove from library"
      className="cursor-pointer rounded-full border border-white/10 bg-black/60 p-2 text-zinc-400 backdrop-blur-md transition-all duration-200 hover:bg-rose-500/30 hover:text-rose-500 aria-busy:cursor-wait aria-busy:opacity-80"
    />
  );
};
