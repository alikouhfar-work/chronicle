import { IconChevronLeft } from '@tabler/icons-react';
import Link from 'next/link';
import { FC } from 'react';

export const LibraryItemNavigation: FC = () => {
  return (
    <div className="flex items-center justify-between border-b border-white/8 pb-3">
      <Link
        href="/library"
        className="apple-pill-btn group flex cursor-pointer items-center gap-2 bg-white/6 px-4 py-2 text-xs font-semibold text-zinc-200 transition-all hover:bg-white/12"
      >
        <IconChevronLeft
          size={16}
          className="text-violet-400 transition-transform group-hover:-translate-x-0.5"
        />
        <span>Back to Library</span>
      </Link>
    </div>
  );
};
