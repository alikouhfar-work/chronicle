'use client';

import { FC, useTransition } from 'react';
import { TrackButtonProps } from '@/features/library/types/trackButton';
import { addMedia } from '@/features/library/actions/addMedia';

export const TrackButton: FC<TrackButtonProps> = ({ tmdbId, mediaType }) => {
  const [pending, startTransition] = useTransition();

  return (
    <button
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await addMedia(tmdbId, mediaType);
        })
      }
      className="bg-gold-400 hover:bg-gold-300 cursor-pointer rounded-lg px-3 py-1.5 font-mono text-[10px] font-black tracking-wider text-zinc-950 uppercase transition-all hover:scale-[1.02]"
    >
      {pending ? 'Adding...' : '+ Track'}
    </button>
  );
};
