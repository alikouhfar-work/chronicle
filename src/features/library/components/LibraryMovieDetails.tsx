'use client';

import { FC } from 'react';
import { LibraryMediaDetailsHeader } from '@/features/library/components/LibraryMediaDetailsHeader';
import { LibraryMovieDetailsProps } from '@/features/library/types/libraryMovieDetails';
import { LibraryItemFooter } from '@/features/library/components/LibraryItemFooter';

export const LibraryMovieDetails: FC<LibraryMovieDetailsProps> = ({ movie, credits }) => {
  return (
    <section className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-y-8 font-sans">
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
      {/*{!isShow && movie && movie.trackedStatus === 'Completed' && (*/}
      {/*  <div className="glass-card space-y-3.5 rounded-2xl border border-white/10 p-6 md:p-7">*/}
      {/*    <div className="flex items-center justify-between border-b border-white/[0.08] pb-2.5">*/}
      {/*      <h4 className="flex items-center gap-2 text-xs font-bold tracking-tight text-violet-400 uppercase">*/}
      {/*        <MessageSquare size={14} className="text-violet-400" />*/}
      {/*        <span>Your Review & Thoughts</span>*/}
      {/*      </h4>*/}
      {/*      <span className="text-xs text-zinc-400">*/}
      {/*        Watched:{' '}*/}
      {/*        {movie.watchedAt ? new Date(movie.watchedAt).toLocaleDateString() : 'Recorded'}*/}
      {/*      </span>*/}
      {/*    </div>*/}

      {/*    {movie.rating || movie.notes ? (*/}
      {/*      <div className="space-y-3">*/}
      {/*        {movie.rating && (*/}
      {/*          <div className="flex w-fit items-center gap-1.5 rounded-full border border-white/10 bg-zinc-900 p-1.5">*/}
      {/*            {[1, 2, 3, 4, 5].map((star) => (*/}
      {/*              <Star*/}
      {/*                key={star}*/}
      {/*                className={*/}
      {/*                  star <= movie.rating! ? 'fill-amber-400 text-amber-400' : 'text-zinc-700'*/}
      {/*                }*/}
      {/*                size={14}*/}
      {/*              />*/}
      {/*            ))}*/}
      {/*          </div>*/}
      {/*        )}*/}
      {/*        {movie.notes ? (*/}
      {/*          <p className="rounded-r-xl border-l-2 border-violet-400 bg-violet-500/[0.04] py-2 pl-3 text-xs leading-relaxed text-zinc-200 italic">*/}
      {/*            "{movie.notes}"*/}
      {/*          </p>*/}
      {/*        ) : (*/}
      {/*          <p className="text-xs text-zinc-400 italic">No written review added yet.</p>*/}
      {/*        )}*/}
      {/*      </div>*/}
      {/*    ) : (*/}
      {/*      <div className="flex flex-col items-center justify-center space-y-2.5 py-5 text-center">*/}
      {/*        <p className="text-xs text-zinc-400">No review or score logged yet for this film.</p>*/}
      {/*        <button*/}
      {/*          onClick={() => {*/}
      {/*            setMovieRating(movie.rating || 0);*/}
      {/*            setMovieNotes(movie.notes || '');*/}
      {/*            setIsEditingMovieLog(true);*/}
      {/*          }}*/}
      {/*          className="apple-pill-btn cursor-pointer bg-violet-500 px-4 py-2 text-xs font-bold text-white shadow-md shadow-violet-500/25 hover:bg-violet-400"*/}
      {/*        >*/}
      {/*          Add Review*/}
      {/*        </button>*/}
      {/*      </div>*/}
      {/*    )}*/}
      {/*  </div>*/}
      {/*)}*/}
      <LibraryItemFooter credits={credits} />
    </section>
  );
};
