import { IconStar } from '@tabler/icons-react';
import { LibraryMovieRatingProps } from '@/modules/library/types/libraryMovieRating';

export const LibraryMovieRating = ({ rating }: LibraryMovieRatingProps) => {
  return (
    <>
      {rating ? (
        <div className="flex items-center gap-1.5 border-t border-white/10 pt-1.5 text-xs font-semibold text-amber-400">
          <IconStar size={10} className="fill-amber-400 text-amber-400" />
          <span>{rating * 2} / 10</span>
        </div>
      ) : (
        <div className="border-t border-white/10 pt-1.5">
          <span className="text-xs font-medium text-zinc-500">Unrated</span>
        </div>
      )}
    </>
  );
};
