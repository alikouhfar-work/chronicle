import { FC } from 'react';
import { IconMovie } from '@tabler/icons-react';

export const PersonDetailsFilmographyEmpty: FC = () => {
  return (
    <div className="glass-card space-y-2 rounded-2xl border border-white/10 p-10 text-center">
      <IconMovie className="mx-auto mb-2 text-zinc-600" size={32} />
      <p className="text-sm font-semibold text-zinc-300">No matching works found</p>
      <p className="text-xs text-zinc-500">Try adjusting your filter or search keywords.</p>
    </div>
  );
};
