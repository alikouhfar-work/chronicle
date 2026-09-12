'use client';

import { FC, useTransition } from 'react';
import { clsx } from 'clsx';
import { LibraryShowStatusChangeButtonProps } from '@/features/library/types/libraryShowStatusChangeButton';
import { updateShowTrackingStatus } from '@/features/show/actions/updateShowTrackingStatus';
import { IconLoader2 } from '@tabler/icons-react';
import toast from 'react-hot-toast';
import { ShowTrackingStatus } from '../../../../../generated/prisma/enums';

export const LibraryShowStatusChangeButton: FC<LibraryShowStatusChangeButtonProps> = ({
  showId,
  showStatus,
  statusFilter,
}) => {
  const [isShowStatusChangePending, startShowStatusChangeTransition] = useTransition();
  const automatic =
    statusFilter.key === ShowTrackingStatus.WATCHING ||
    statusFilter.key === ShowTrackingStatus.COMPLETED;

  const handleShowStatusChange = (status: ShowTrackingStatus) => {
    startShowStatusChangeTransition(async () => {
      void toast.promise(updateShowTrackingStatus(showId, status), {
        loading: 'Updating show status…',
        success: `Show marked as ${statusFilter.title.toLowerCase()}.`,
        error: 'Couldn’t update the show status. Please try again.',
      });
    });
  };

  return (
    <button
      disabled={automatic}
      aria-busy={isShowStatusChangePending}
      onClick={() => !automatic && handleShowStatusChange(statusFilter.key)}
      className={clsx(
        automatic && 'cursor-not-allowed',
        'aria-busy:cursor-wait aria-busy:opacity-80',
        'apple-pill-btn px-3.5 py-1.5 text-xs transition-all duration-150',
        !automatic && statusFilter.key !== showStatus && 'cursor-pointer hover:text-zinc-200',
        showStatus === statusFilter.key
          ? 'bg-white font-bold text-zinc-950 shadow-md'
          : 'text-zinc-400 hover:bg-white/6 hover:text-white',
      )}
    >
      {isShowStatusChangePending && <IconLoader2 size={12} className="animate-spin" />}
      {statusFilter.title}
    </button>
  );
};
