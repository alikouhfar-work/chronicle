import { LibraryMediaSectionProps } from '@/features/library/types/libraryMediaSection';
import { LibraryCard } from '@/features/library/components/LibraryCard';
import { FC } from 'react';

export const LibraryMediaSection: FC<LibraryMediaSectionProps> = ({
  media,
  mediaType,
  icon: Icon,
  emptyListTitle,
  emptyListSubtitle,
}) => {
  return (
    <div className="animate-fade-in space-y-6">
      {media.length === 0 ? (
        <div className="glass-card flex flex-col items-center justify-center space-y-3 rounded-2xl border border-dashed border-white/10 p-8 py-20 text-center">
          <div className="rounded-2xl border border-violet-500/25 bg-violet-500/15 p-4 text-violet-400">
            <Icon size={32} />
          </div>
          <div className="max-w-sm space-y-1">
            <p className="text-base font-bold text-white">{emptyListTitle}</p>
            <p className="text-xs leading-relaxed font-normal text-zinc-400">{emptyListSubtitle}</p>
          </div>
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {media.map((item) => (
            <LibraryCard key={item.id} media={item} mediaType={mediaType} />
          ))}
        </ul>
      )}
    </div>
  );
};
