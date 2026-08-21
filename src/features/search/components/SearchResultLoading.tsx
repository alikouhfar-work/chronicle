import { IconLoader2 } from '@tabler/icons-react';

export const SearchResultSkeleton = () => {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 py-20">
      <IconLoader2 className="animate-spin text-indigo-400" size={40} />
      <div className="space-y-1 text-center">
        <p className="text-sm font-medium text-zinc-300">Consulting Chronicle database...</p>
        <p className="max-w-xs text-xs leading-relaxed text-zinc-500">
          Gemini is structuring detailed episodes, air dates, summaries, and exact season maps.
        </p>
      </div>
    </div>
  );
}