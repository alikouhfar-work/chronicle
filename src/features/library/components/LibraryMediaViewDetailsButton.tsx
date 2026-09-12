import { FC } from 'react';
import Link from 'next/link';
import { clsx } from 'clsx';
import { LibraryMediaViewDetailsButtonProps } from '@/features/library/types/libraryMediaViewDetailsButton';
import { IconCircleCheck } from '@tabler/icons-react';

export const LibraryMediaViewDetailsButton: FC<LibraryMediaViewDetailsButtonProps> = ({
  tmdbId,
  mediaType,
  className,
  unstyled,
  showIcon = false,
}) => {
  return (
    <Link
      href={`/library/${mediaType}/${tmdbId}`}
      className={clsx(
        'flex cursor-pointer items-center justify-center gap-1 rounded-full',
        !unstyled &&
          'cursor-pointer border border-violet-500/30 bg-white/8 px-3 py-1.5 text-xs text-violet-400 hover:bg-white/15',
        className,
      )}
    >
      {showIcon && <IconCircleCheck size={12} className="text-violet-400" />}
      <span>In Library</span>
    </Link>
  );
};
