import { IconTrendingUp, IconUser } from '@tabler/icons-react';
import type { PersonDetailsNavigationProps } from '@/modules/discovery/person/types/personDetailsNavigation';
import { BackButton } from '@/shared/ui/BackButton';

export const PersonDetailsNavigation = ({ person }: PersonDetailsNavigationProps) => {
  return (
    <div className="flex items-center justify-between border-b border-line pb-3">
      <BackButton href="/search" label="Back to search" />

      <div className="flex items-center gap-2">
        <span className="apple-badge flex items-center gap-1.5 border border-accent-line bg-accent-bright/15 text-xs text-accent-ink">
          <IconUser size={12} className="text-accent-ink" />
          <span>{person.knownForDepartment || 'Acting'}</span>
        </span>
        {person.popularity && (
          <span className="apple-badge flex items-center gap-1 border border-line bg-surface-soft text-xs text-ink-secondary">
            <IconTrendingUp size={11} className="text-rating" />
            <span>Score: {person.popularity.toFixed(1)}</span>
          </span>
        )}
      </div>
    </div>
  );
};
