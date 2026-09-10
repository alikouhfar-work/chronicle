import { IconTrendingUp, IconUser } from '@tabler/icons-react';
import { FC } from 'react';
import { PersonDetailsNavigationProps } from '@/features/person/types/personDetailsNavigation';
import { PersonDetailsBackButton } from '@/features/person/components/PersonDetailsBackButton';

export const PersonDetailsNavigation: FC<PersonDetailsNavigationProps> = ({ person }) => {
  return (
    <div className="flex items-center justify-between border-b border-white/8 pb-3">
      <PersonDetailsBackButton />

      <div className="flex items-center gap-2">
        <span className="apple-badge flex items-center gap-1.5 border border-violet-500/30 bg-violet-500/15 text-xs text-violet-300">
          <IconUser size={12} className="text-violet-400" />
          <span>{person.knownForDepartment || 'Acting'}</span>
        </span>
        {person.popularity && (
          <span className="apple-badge flex items-center gap-1 border border-white/10 bg-white/6 text-xs text-zinc-300">
            <IconTrendingUp size={11} className="text-amber-400" />
            <span>Score: {person.popularity.toFixed(1)}</span>
          </span>
        )}
      </div>
    </div>
  );
};
