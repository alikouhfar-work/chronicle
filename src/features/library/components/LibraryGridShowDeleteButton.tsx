'use client';

import { IconTrash } from '@tabler/icons-react';
import { FC, useTransition } from 'react';
import { LibraryGridShowDeleteButtonProps } from '@/app/(main)/library/_types/libraryGridShowDeleteButton';
import { deleteShowFromLibrary } from '@/features/show/actions/deleteShowFromLibrary';

export const LibraryGridShowDeleteButton: FC<LibraryGridShowDeleteButtonProps> = ({ showId }) => {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      await deleteShowFromLibrary(showId);
    });
  };

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        handleDelete();
      }}
      disabled={isPending}
      className="border-zinc-850/80 cursor-pointer rounded-full border bg-zinc-950/80 p-1.5 text-zinc-400 backdrop-blur-sm transition-all duration-300 hover:bg-red-500/20 hover:text-red-400 disabled:opacity-50"
      title="Delete from collection"
    >
      {isPending ? (
        <span className="block size-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : (
        <IconTrash size={12} />
      )}
    </button>
  );
};
