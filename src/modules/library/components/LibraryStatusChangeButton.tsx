'use client';

import { clsx } from 'clsx';
import { ActionButton } from '@/shared/ui/ActionButton';
import { useServerAction } from '@/shared/hooks/useServerAction';
import type { LibraryStatusChangeButtonProps } from '@/modules/library/types/libraryStatusChangeButton';

export const LibraryStatusChangeButton = ({
  entityId,
  entityLabel,
  currentStatus,
  statusFilter,
  disabled = false,
  updateStatus,
}: LibraryStatusChangeButtonProps) => {
  const { execute: changeStatus, isPending } = useServerAction(
    () => updateStatus(entityId, statusFilter.key),
    {
      successMessage: `${entityLabel} marked as ${statusFilter.title.toLowerCase()}.`,
      errorMessage: `Couldn’t update the ${entityLabel.toLowerCase()} status. Please try again.`,
    },
  );

  const isActive = currentStatus === statusFilter.key;

  return (
    <ActionButton
      disabled={disabled}
      isPending={isPending}
      onClick={changeStatus}
      aria-label={`Mark ${entityLabel.toLowerCase()} as ${statusFilter.title}`}
      className={clsx(
        disabled && 'cursor-not-allowed',
        'aria-busy:cursor-wait aria-busy:opacity-80',
        'apple-pill-btn px-3.5 py-1.5 text-xs transition-all duration-150',
        !disabled && !isActive && 'cursor-pointer hover:text-zinc-200',
        isActive
          ? 'bg-white font-bold text-zinc-950 shadow-md'
          : 'text-zinc-400 hover:bg-white/6 hover:text-white',
      )}
    >
      {statusFilter.title}
    </ActionButton>
  );
};
