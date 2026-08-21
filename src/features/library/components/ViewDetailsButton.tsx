import { FC } from 'react';
import Link from 'next/link';
import { ViewDetailsButtonProps } from '@/features/library/types/viewDetailsButton';

export const ViewDetailsButton: FC<ViewDetailsButtonProps> = ({ tmdbId, mediaType }) => {
  return (
    <Link
      href={`/library/${mediaType}/${tmdbId}`}
      className="hover:bg-zinc-750 text-gold-400 hover:text-gold-300 cursor-pointer rounded-lg border border-zinc-700/50 bg-zinc-800 px-3 py-1.5 font-mono text-[10px] font-bold tracking-wider uppercase transition-colors"
    >
      View details
    </Link>
  );
};
