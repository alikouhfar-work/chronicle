import { IconStar } from '@tabler/icons-react';
import type { LibraryMovieRatingProps } from '@/modules/library/types/libraryMovieRating';

export const LibraryMovieRating = ({ rating }: LibraryMovieRatingProps) => {
  return (
    <>
      {rating ? (
        <div className="flex items-center gap-1.5 border-t border-line pt-1.5 text-xs font-semibold text-rating">
          <IconStar size={10} className="fill-rating text-rating" />
          <span>{rating * 2} / 10</span>
        </div>
      ) : (
        <div className="border-t border-line pt-1.5">
          <span className="text-xs font-medium text-ink-muted">Unrated</span>
        </div>
      )}
    </>
  );
};
