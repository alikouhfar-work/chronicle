import { FC } from 'react';
import Link from 'next/link';
import { ViewDetailsButtonProps } from '@/features/library/types/viewDetailsButton';

export const ViewDetailsButton: FC<ViewDetailsButtonProps> = ({ tmdbId, mediaType }) => {
  return (
    <Link
      href={`/library/${mediaType}/${tmdbId}`}
      className="apple-pill-btn cursor-pointer border border-violet-500/30 bg-white/8 px-3 py-1.5 text-xs text-violet-400 hover:bg-white/15"
    >
      In Library
    </Link>
  );
};
