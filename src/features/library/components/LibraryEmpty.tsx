import { IconAdjustmentsHorizontal } from '@tabler/icons-react';

export const LibraryEmpty = () => {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/5 py-24 text-center">
      <IconAdjustmentsHorizontal className="text-zinc-700" size={38} />
      <div className="space-y-1.5">
        <p className="text-sm font-semibold text-zinc-300">No media matches your search</p>
        <p className="max-w-sm text-xs text-zinc-500">
          Try modifying your filters, clearing search input, or click the Search / Add tab above to
          track some new media!
        </p>
      </div>
    </div>
  );
};
