'use client';

import { LibraryMediaTrackButtonProps } from '@/modules/library/types/libraryMediaTrackButton';
import { addMediaAction } from '@/modules/library/actions/addMediaAction';
import { IconPlus } from '@tabler/icons-react';
import { clsx } from 'clsx';
import { useServerAction } from '@/shared/hooks/useServerAction';
import { ActionButton } from '@/shared/ui/ActionButton';

export const LibraryMediaTrackButton = ({
  tmdbId,
  mediaType,
  className,
  unstyled,
  label = 'Add',
}: LibraryMediaTrackButtonProps) => {
  const { execute: addMedia, isPending } = useServerAction(
    () => addMediaAction({ tmdbId, mediaType }),
    {
      successMessage: 'Added to your library',
      errorMessage: 'Couldn’t add this title. Please try again.',
    },
  );

  return (
    <ActionButton
      onClick={addMedia}
      isPending={isPending}
      icon={<IconPlus size={12} strokeWidth={2.6} />}
      aria-label="Add to your library"
      className={clsx(
        'hover:scale-[1.03] aria-busy:cursor-wait aria-busy:opacity-80',
        'flex cursor-pointer items-center justify-center gap-1 rounded-full',
        !unstyled &&
          'cursor-pointer rounded-full border border-violet-500 bg-violet-500 px-3.5 py-1.5 text-xs font-bold text-white shadow-md shadow-violet-500/20 hover:bg-violet-400',
        className,
      )}
    >
      <span>{label}</span>
    </ActionButton>
  );
};
