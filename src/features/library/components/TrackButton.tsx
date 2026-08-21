'use client';

import { FC, useTransition } from 'react';
import { TrackButtonProps } from '@/features/library/types/trackButton';
import { addMediaAction } from '@/features/library/actions/addMediaAction';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export const TrackButton: FC<TrackButtonProps> = ({ tmdbId, mediaType }) => {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const handleWatch = () => {
    startTransition(async () => {
      const result = await addMediaAction({ tmdbId, mediaType });

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success('Added to your library');
      router.refresh();
    });
  };

  return (
    <button
      aria-busy={pending}
      onClick={handleWatch}
      className="bg-gold-400 hover:bg-gold-300 aria-busy:false:hover:scale-[1.02] cursor-pointer rounded-lg px-3 py-1.5 font-mono text-[10px] font-black tracking-wider text-zinc-950 uppercase transition-all aria-busy:cursor-wait aria-busy:opacity-70"
    >
      {pending ? 'Adding...' : '+ Track'}
    </button>
  );
};
