'use client';

import { FC, useTransition } from 'react';
import { TrackButtonProps } from '@/features/library/types/trackButton';
import { addMediaAction } from '@/features/library/actions/addMediaAction';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { IconLoader2, IconPlus } from '@tabler/icons-react';
import { clsx } from 'clsx';

export const TrackButton: FC<TrackButtonProps> = ({
  tmdbId,
  mediaType,
  className,
  unstyled,
  label = 'Add',
}) => {
  const router = useRouter();
  const [isAddMediaPending, startAddMediaTransition] = useTransition();

  const handleAddMedia = () => {
    startAddMediaTransition(async () => {
      const result = await addMediaAction({ tmdbId, mediaType });

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success('Added to your library');
      router.refresh();
    });
  };

  return (
    <button
      onClick={handleAddMedia}
      aria-busy={isAddMediaPending}
      className={clsx(
        'hover:scale-[1.03] aria-busy:cursor-wait aria-busy:opacity-80',
        'flex cursor-pointer items-center justify-center gap-1 rounded-full',
        !unstyled &&
          'cursor-pointer rounded-full border border-violet-500 bg-violet-500 px-3.5 py-1.5 text-xs font-bold text-white shadow-md shadow-violet-500/20 hover:bg-violet-400',
        className,
      )}
    >
      {isAddMediaPending ? (
        <IconLoader2 size={12} className="animate-spin" />
      ) : (
        <IconPlus size={12} strokeWidth={2.6} />
      )}
      <span>{label}</span>
    </button>
  );
};
