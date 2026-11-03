'use client';

import { useState } from 'react';
import { IconHistory } from '@tabler/icons-react';
import { clsx } from 'clsx';
import { RewatchHistoryModal } from '@/modules/rewatch/components/RewatchHistoryModal';
import type { RewatchHistoryButtonProps } from '@/modules/rewatch/types/rewatch';

export const RewatchHistoryButton = ({
  mediaType,
  mediaId,
  title,
  count = 0,
  className,
}: RewatchHistoryButtonProps) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      {open && (
        <RewatchHistoryModal
          mediaType={mediaType}
          mediaId={mediaId}
          title={title}
          initialCount={count}
          onClose={() => setOpen(false)}
        />
      )}

      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Open watch history for ${title}`}
        title="Watch history"
        className={clsx(
          'flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-lg bg-white/6 text-zinc-300 hover:bg-white/12',
          className,
        )}
      >
        <IconHistory size={12} />
      </button>
    </>
  );
};
