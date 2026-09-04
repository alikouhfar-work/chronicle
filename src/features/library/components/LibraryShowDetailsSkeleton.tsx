'use client';

import { FC } from 'react';
import { useParams } from 'next/navigation';

export const LibraryMediaDetailsSkeleton: FC = () => {
  const { slug } = useParams();

  const mediaType = slug?.[0] || 'tv';

  return (
    <>
      {mediaType === 'tv' ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
          {/* Seasons list selectors */}
          <div className="shrink-0 space-y-3">
            <div className="h-3.5 w-20 animate-pulse rounded bg-zinc-700/80" />
            <div className="flex flex-row gap-2 overflow-x-auto pb-2 md:flex-col md:overflow-visible md:pb-0">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className="glass-card flex min-w-35 items-center justify-between gap-3 rounded-2xl border border-white/8 px-4 py-3 md:min-w-0"
                >
                  <div className="flex items-center gap-2">
                    <div className="h-3.5 w-3.5 animate-pulse rounded bg-zinc-700" />
                    <div className="h-3 w-16 animate-pulse rounded bg-zinc-700" />
                  </div>
                  <div className="h-4 w-8 animate-pulse rounded-full bg-white/8" />
                </div>
              ))}
            </div>
          </div>

          {/* Episode Checklists for selected season */}
          <div className="space-y-3.5 md:col-span-3">
            <div className="flex items-center justify-between border-b border-white/8 pb-2">
              <div className="h-6 w-48 animate-pulse rounded-lg bg-zinc-700" />
              <div className="flex items-center gap-2">
                <div className="h-7 w-24 animate-pulse rounded-full border border-violet-500/25 bg-violet-500/15" />
                <div className="h-7 w-20 animate-pulse rounded-full border border-white/10 bg-white/6" />
              </div>
            </div>

            {/* Episodes check list */}
            <div className="space-y-2.5">
              {[1, 2, 3].map((ep) => (
                <div
                  key={ep}
                  className="glass-card flex items-start gap-3.5 rounded-2xl border border-white/8 p-4"
                >
                  <div className="mt-0.5 h-6 w-6 shrink-0 animate-pulse rounded-full border border-white/10 bg-zinc-800" />

                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-16 animate-pulse rounded bg-violet-400/30" />
                      <div className="h-3 w-20 animate-pulse rounded bg-zinc-800" />
                    </div>

                    <div className="h-4 w-48 animate-pulse rounded-md bg-zinc-700" />
                    <div className="h-3 w-4/5 animate-pulse rounded-md bg-zinc-800/80" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="glass-card space-y-4 rounded-2xl border border-white/10 p-6 md:p-7">
          <div className="flex items-center justify-between border-b border-white/8 pb-3">
            <div className="h-4 w-36 animate-pulse rounded bg-violet-400/30" />
            <div className="h-3 w-20 animate-pulse rounded bg-zinc-800" />
          </div>
          <div className="space-y-3">
            <div className="flex w-fit items-center gap-2 rounded-full border border-white/10 bg-zinc-900 p-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <div key={star} className="h-3.5 w-3.5 animate-pulse rounded-full bg-zinc-800" />
              ))}
            </div>
            <div className="space-y-2 border-l-2 border-violet-400/40 py-2 pl-3">
              <div className="h-3.5 w-3/4 animate-pulse rounded bg-zinc-800" />
              <div className="h-3.5 w-1/2 animate-pulse rounded bg-zinc-800/70" />
            </div>
          </div>
        </div>
      )}
    </>
  );
};
