import { IconStar } from '@tabler/icons-react';
import { FC } from 'react';
import { LibraryMovieRatingProps } from '@/features/library/types/libraryMovieRating';

export const LibraryMovieRating: FC<LibraryMovieRatingProps> = ({ rating }) => {
  return (
    <>
      {rating ? (
        <div className="text-gold-400 flex items-center gap-1.5 border-t border-zinc-900/30 pt-1.5">
          <IconStar size={11} className="fill-gold-400 text-gold-400" />
          <span className="font-mono text-[10px] font-bold">{rating} / 10</span>
        </div>
      ) : (
        <div className="border-t border-zinc-900/30 pt-1">
          <span className="font-mono text-[9px] text-zinc-500">Unrated</span>
        </div>
      )}
    </>
  );
};
