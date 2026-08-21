import { IconChevronLeft } from '@tabler/icons-react';
import Link from 'next/link';
import { FC } from 'react';

export const LibraryItemNavigation: FC = () => {
  return (
    <div className="flex items-center justify-between">
      <Link
        href="/library"
        className="group flex cursor-pointer items-center gap-2 font-mono text-xs tracking-widest text-zinc-400 uppercase transition-all hover:text-white"
      >
        <IconChevronLeft
          size={16}
          className="text-gold-400 transition-transform group-hover:-translate-x-0.5"
        />
        <span>Back to Library</span>
      </Link>
    </div>
  );
};
