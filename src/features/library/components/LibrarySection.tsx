import { LibrarySectionProps } from '@/features/library/types/librarySection';
import { LibraryCard } from '@/features/library/components/LibraryCard';
import { FC } from 'react';

export const LibrarySection: FC<LibrarySectionProps> = ({
  media,
  mediaType,
  icon: Icon,
  emptyMessage,
}) => {
  return (
    <div className="space-y-5">
      <div className="border-zinc-850/80 flex items-center justify-between border-b pb-3">
        <div className="flex items-center gap-3">
          <div className="bg-gold-400/10 border-gold-400/20 text-gold-400 rounded-xl border p-2">
            <Icon size={18} />
          </div>
          <div>
            <h3 className="flex items-center gap-2.5 font-serif text-xl font-extrabold tracking-tight text-white md:text-2xl">
              <span>TV Series</span>
              <span className="text-gold-400 bg-gold-400/10 border-gold-400/20 rounded-full border px-2.5 py-0.5 font-mono text-xs font-bold">
                {media.length}
              </span>
            </h3>
          </div>
        </div>
      </div>

      {media.length === 0 ? (
        <div className="border-zinc-850/60 rounded-xl border bg-zinc-900/20 p-6 text-center">
          <p className="font-mono text-xs text-zinc-500">{emptyMessage}</p>
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {media.map((item) => (
            <LibraryCard key={item.id} media={item} mediaType={mediaType}/>
          ))}
        </ul>
      )}
    </div>
  );
};
