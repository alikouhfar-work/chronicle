'use client'

import { FC } from 'react';
import { useRouter } from 'next/navigation';
import { IconChevronLeft } from '@tabler/icons-react';

export const PersonDetailsBackButton: FC = () => {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.back()}
      className="apple-pill-btn group flex cursor-pointer items-center gap-2 bg-white/6 px-4 py-2 text-xs font-semibold text-zinc-200 transition-all hover:bg-white/12"
    >
      <IconChevronLeft
        size={16}
        className="text-violet-400 transition-transform group-hover:-translate-x-0.5"
      />
      <span>Back</span>
    </button>
  );
};
