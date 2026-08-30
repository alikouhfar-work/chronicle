'use client';

import { FC, useTransition } from 'react';
import { MovieTrackingStatus } from '../../../../generated/prisma/enums';
import { IconLoader2 } from '@tabler/icons-react';
import { LibraryMovieStatusChangeButtonProps } from '@/features/library/types/libraryMovieStatusChangeButton';
import { updateMovieTrackingStatus } from '@/features/movie/actions/updateMovieTrackingStatus';
import toast from 'react-hot-toast';

export const LibraryMovieStatusChangeButton: FC<LibraryMovieStatusChangeButtonProps> = ({
  movieId,
  movieStatus,
  statusFilter,
}) => {
  const [isMovieStatusChangePending, startMovieStatusChangeTransition] = useTransition();

  const handleMovieStatusChange = (status: MovieTrackingStatus) => {
    startMovieStatusChangeTransition(() => {
      void toast.promise(updateMovieTrackingStatus(movieId, status), {
        loading: 'Updating movie status…',
        success: `Movie marked as ${statusFilter.title.toLowerCase()}.`,
        error: 'Couldn’t update the movie status. Please try again.',
      });
    });
  };

  return (
    <button
      aria-busy={isMovieStatusChangePending}
      onClick={() => handleMovieStatusChange(statusFilter.key)}
      className={`apple-pill-btn cursor-pointer px-3.5 py-1.5 text-xs transition-all duration-150 aria-busy:cursor-wait aria-busy:opacity-80 ${
        movieStatus === statusFilter.key
          ? 'bg-white font-bold text-zinc-950 shadow-md'
          : 'text-zinc-400 hover:bg-white/6 hover:text-white'
      }`}
    >
      {isMovieStatusChangePending && <IconLoader2 size={12} className="animate-spin" />}
      {statusFilter.title}
    </button>
  );
};
