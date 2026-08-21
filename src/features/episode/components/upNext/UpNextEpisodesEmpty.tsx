import { IconDeviceTv } from '@tabler/icons-react';
import { FC } from 'react';

export const UpNextEpisodesEmpty: FC = () => {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 rounded-xl border border-dashed border-zinc-800 bg-zinc-900/20 p-12 text-center">
      <IconDeviceTv className="text-zinc-600" size={44} />
      <div className="space-y-1.5">
        <p className="text-sm font-bold text-zinc-300">No active shows in your library</p>
        <p className="max-w-sm text-xs leading-relaxed text-zinc-500">
          Search the catalog or add titles manually. Mark them as Watching under the Library tab to
          view queued episodes here.
        </p>
      </div>
    </div>
  );
};
