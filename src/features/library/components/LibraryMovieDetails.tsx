'use client';

import { FC } from 'react';
import { LibraryMediaDetailsHeader } from '@/features/library/components/LibraryMediaDetailsHeader';
import { LibraryMovieDetailsProps } from '@/features/library/types/libraryMovieDetails';
import { LibraryItemFooter } from '@/features/library/components/LibraryItemFooter';

export const LibraryMovieDetails: FC<LibraryMovieDetailsProps> = ({ movie, credits }) => {
  return (
    <article className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-y-8 font-sans">
      {/*{toastMessage && (*/}
      {/*  <div className="animate-fade-in relative flex items-center justify-between overflow-hidden rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 font-mono text-xs text-emerald-400">*/}
      {/*    <div className="pointer-events-none absolute -top-12 -left-12 h-24 w-24 rounded-full bg-emerald-500/5 blur-2xl" />*/}
      {/*    <div className="flex items-center gap-2">*/}
      {/*      <IconCircleCheck size={14} className="shrink-0 text-emerald-400" />*/}
      {/*      <span>{toastMessage}</span>*/}
      {/*    </div>*/}
      {/*    <button*/}
      {/*      onClick={() => setToastMessage(null)}*/}
      {/*      className="cursor-pointer text-[9px] font-bold text-emerald-500 uppercase hover:text-emerald-300"*/}
      {/*    >*/}
      {/*      Dismiss*/}
      {/*    </button>*/}
      {/*  </div>*/}
      {/*)}*/}
      <LibraryMediaDetailsHeader media={movie} />
      <LibraryItemFooter credits={credits} />
    </article>
  );
};
