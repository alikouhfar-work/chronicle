import { IconShield } from '@tabler/icons-react';
import type { SearchResultErrorProps } from '@/modules/discovery/search/types/searchResultError';

export const SearchResultError = ({ message }: SearchResultErrorProps) => {
  return (
    <div className="mx-auto flex max-w-2xl items-start gap-4 rounded-xl border border-red-500/20 bg-red-500/10 p-5">
      <IconShield className="shrink-0 text-red-400" size={22} />
      <div className="space-y-1.5">
        <h4 className="text-sm font-semibold text-red-200">Search Failed</h4>
        <p className="text-xs leading-relaxed text-red-400">
          {message ?? 'Could not load search results. Please try again.'}
        </p>
        <p className="text-[11px] text-zinc-500">
          If this persists, check your connection and TMDB configuration.
        </p>
      </div>
    </div>
  );
};
