import { IconDeviceTv } from '@tabler/icons-react';
import { FC } from 'react';

export const UpNextEpisodesEmpty: FC = () => {
  return (
    <div className="glass-card flex flex-col items-center justify-center space-y-3 rounded-2xl border border-dashed border-white/10 p-12 text-center">
      <IconDeviceTv className="text-zinc-600" size={44} />
      <div className="space-y-1">
        <p className="text-sm font-semibold text-zinc-200">No episodes in progress</p>
        <p className="max-w-sm text-xs leading-relaxed text-zinc-400">
          Add a show to your library and set its status to &#34;Watching&#34; to have your next
          episode appear here.
        </p>
      </div>
    </div>
  );
};
