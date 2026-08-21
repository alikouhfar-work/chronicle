import { FC } from 'react';
import { UpcomingMediaEmptyProps } from '@/types/upcoming';
import Link from 'next/link';

export const UpcomingMediaEmpty: FC<UpcomingMediaEmptyProps> = ({
  icon: Icon,
  title,
  subTitle,
}) => {
  return (
    <div className="border-zinc-850 flex flex-col items-center justify-center rounded-2xl border border-dashed bg-zinc-900/25 p-8 text-center sm:p-10">
      <div className="bg-gold-400/10 border-gold-400/20 text-gold-400 mb-3.5 flex h-12 w-12 items-center justify-center rounded-2xl border shadow-sm">
        <Icon className="size-5.5 opacity-90" />
      </div>
      <h5 className="mb-1.5 font-serif text-sm font-bold text-white sm:text-base">{title}</h5>
      <p className="mb-4 max-w-xs text-xs leading-relaxed text-zinc-400">{subTitle}</p>
      <Link
        href="/search"
        className="text-gold-400 bg-gold-400/10 hover:bg-gold-400/20 border-gold-400/30 hover:border-gold-400/50 inline-flex cursor-pointer items-center gap-2 rounded-xl border px-3.5 py-2 font-mono text-xs font-semibold shadow-sm transition-all active:scale-98"
      >
        Explore Media
      </Link>
    </div>
  );
};
