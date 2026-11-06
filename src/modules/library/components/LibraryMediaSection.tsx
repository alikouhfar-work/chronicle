import type { LibraryMediaSectionProps } from '@/modules/library/types/libraryMediaSection';
import { LibraryCard } from '@/modules/library/components/LibraryCard';
import { EmptyState } from '@/shared/ui/EmptyState';

export const LibraryMediaSection = ({
  media,
  mediaType,
  icon: Icon,
  emptyListTitle,
  emptyListSubtitle,
  children,
}: LibraryMediaSectionProps) => {
  return (
    <div className="animate-fade-in space-y-6">
      {media.length === 0 ? (
        (children ?? (
          <EmptyState
            icon={Icon}
            title={emptyListTitle}
            description={emptyListSubtitle}
            className="py-16"
          />
        ))
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
