'use client';

import { IconLoader2, IconTrash } from '@tabler/icons-react';
import { FC, useTransition } from 'react';
import { deleteShowFromLibrary } from '@/features/show/actions/deleteShowFromLibrary';
import { LibraryMediaDeleteButtonProps } from '@/features/library/types/libraryMediaDeleteButton';
import toast from 'react-hot-toast';
import { deleteMovieFromLibrary } from '@/features/movie/actions/deleteMovieFromLibrary';

export const LibraryMediaDeleteButton: FC<LibraryMediaDeleteButtonProps> = ({
  mediaId,
  mediaType,
}) => {
  const [isDeleteMediaPending, startDeleteMediaTransition] = useTransition();

  const handleDelete = () => {
    startDeleteMediaTransition(async () => {
      if (mediaType === 'tv') {
        await deleteShowFromLibrary(mediaId);
        toast.success('Series deleted from library');
      } else {
        await deleteMovieFromLibrary(mediaId);
        toast.success('Movie deleted from library');
      }
    });
  };

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        handleDelete();
      }}
      aria-busy={isDeleteMediaPending}
      className="cursor-pointer rounded-full border border-white/10 bg-black/60 p-2 text-zinc-400 backdrop-blur-md transition-all duration-200 hover:bg-rose-500/30 hover:text-rose-500 aria-busy:cursor-wait aria-busy:opacity-80"
      title="Remove from library"
    >
      {isDeleteMediaPending ? (
        <IconLoader2 size={12} className="animate-spin" />
      ) : (
        <IconTrash size={12} strokeWidth={2.6} />
      )}
    </button>
  );
};
