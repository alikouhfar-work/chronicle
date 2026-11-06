import { IconShield } from '@tabler/icons-react';
import type { SearchResultErrorProps } from '@/modules/discovery/search/types/searchResultError';

export const SearchResultError = ({ message }: SearchResultErrorProps) => {
  return (
    <div className="mx-auto flex max-w-2xl items-start gap-4 rounded-control border border-danger/30 bg-danger-soft p-5">
      <IconShield className="shrink-0 text-danger" size={22} />
      <div className="space-y-1.5">
        <h4 className="text-sm font-semibold text-ink-secondary">Search Failed</h4>
        <p className="text-xs leading-relaxed text-danger">
          {message ?? 'Could not load search results. Please try again.'}
        </p>
        <p className="text-micro text-ink-muted">
          If this persists, check your connection and TMDB configuration.
        </p>
      </div>
    </div>
  );
};
