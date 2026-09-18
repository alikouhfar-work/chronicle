'use client';

import { TrackedMovie } from '@/features/movie';
import { FC, useState } from 'react';
import { IconMessage, IconMovie, IconStar } from '@tabler/icons-react';
import { LibraryDetailsLogModal } from '@/features/library/components/details/LibraryDetailsLogModal';
import { addMovieLog } from '@/features/movie/actions/addMovieLog';

export type LibraryDetailsMovieLogProps = {
  movie: TrackedMovie;
};

export const LibraryDetailsMovieLog: FC<LibraryDetailsMovieLogProps> = ({ movie }) => {
  const [isEditingMovieLog, setIsEditingMovieLog] = useState(false);
  const rating = movie.tracking?.rating || 0;

  return (
    <>
      {isEditingMovieLog && (
        <LibraryDetailsLogModal
          icon={<IconMovie size={18} className="text-violet-400" />}
          title={`Review: ${movie.name}`}
          hiddenFields={{ movieId: movie.id }}
          initialRating={movie.tracking?.rating ?? 0}
          initialNotes={movie.tracking?.notes ?? ''}
          action={addMovieLog}
          onClose={() => setIsEditingMovieLog(false)}
        />
      )}

      <div className="glass-card space-y-3.5 rounded-3xl border border-white/10 p-6 md:p-7">
        <div className="flex items-center justify-between border-b border-white/8 pb-2.5">
          <h4 className="flex items-center gap-2 text-xs font-bold tracking-tight text-violet-400 uppercase">
            <IconMessage size={14} className="text-violet-400" />
            <span>Your Review &amp; Thoughts</span>
          </h4>
        </div>

        {movie.tracking?.rating || movie.tracking?.notes ? (
          <div className="space-y-3">
            {movie.tracking.rating && (
              <div className="flex w-fit items-center gap-1.5 rounded-full border border-white/10 bg-zinc-900 p-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <IconStar
                    key={star}
                    className={star <= rating ? 'fill-amber-400 text-amber-400' : 'text-zinc-700'}
                    size={14}
                  />
                ))}
              </div>
            )}
            {movie.tracking.notes ? (
              <p className="rounded-r-xl border-l-2 border-violet-400 bg-violet-500/[0.04] py-2 pl-3 text-xs leading-relaxed text-zinc-200 italic">
                &#34;{movie.tracking.notes}&#34;
              </p>
            ) : (
              <p className="text-xs text-zinc-400 italic">No written review added yet.</p>
            )}
            <button
              onClick={() => setIsEditingMovieLog(true)}
              className="apple-pill-btn cursor-pointer bg-white/6 px-4 py-2 text-xs font-semibold text-zinc-200 hover:bg-white/[0.12]"
            >
              Edit Review
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-2.5 py-5 text-center">
            <p className="text-xs text-zinc-400">No review or score logged yet for this film.</p>
            <button
              onClick={() => setIsEditingMovieLog(true)}
              className="apple-pill-btn cursor-pointer bg-violet-500 px-4 py-2 text-xs font-bold text-white shadow-md shadow-violet-500/25 hover:bg-violet-400"
            >
              Add Review
            </button>
          </div>
        )}
      </div>
    </>
  );
};
