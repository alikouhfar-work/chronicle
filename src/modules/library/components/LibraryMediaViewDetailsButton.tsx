import Link from 'next/link';
import { clsx } from 'clsx';
import type { LibraryMediaViewDetailsButtonProps } from '@/modules/library/types/libraryMediaViewDetailsButton';
import { IconCircleCheck } from '@tabler/icons-react';

export const LibraryMediaViewDetailsButton = ({
  tmdbId,
  mediaType,
  className,
  unstyled,
  showIcon = false,
}: LibraryMediaViewDetailsButtonProps) => {
  return (
    <Link
      href={`/library/${mediaType}/${tmdbId}`}
      className={clsx(
        'flex cursor-pointer items-center justify-center gap-1 rounded-pill',
        !unstyled &&
          'cursor-pointer border border-accent-line bg-surface-soft px-3 py-1.5 text-xs text-accent-ink hover:bg-surface-soft-hover',
        className,
      )}
    >
      {showIcon && <IconCircleCheck size={12} className="text-accent-ink" />}
      <span>In Library</span>
    </Link>
  );
};
