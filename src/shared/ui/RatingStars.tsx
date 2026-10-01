'use client';

import { IconStar } from '@tabler/icons-react';
import { clsx } from 'clsx';
import type { RatingStarsProps } from '@/shared/types/ratingStars';

export const RatingStars = ({ value, onChange, max = 5, size = 24, disabled }: RatingStarsProps) => {
  return (
    <div className="flex w-fit items-center gap-2 rounded-2xl border border-white/10 bg-white/4 p-3">
      {Array.from({ length: max }, (_, i) => i + 1).map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange?.(value === star ? 0 : star)}
          disabled={disabled || !onChange}
          aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
          className={clsx(
            'p-1 transition-all duration-150',
            onChange && 'cursor-pointer hover:scale-125 active:scale-95',
            disabled && 'opacity-60',
          )}
        >
          <IconStar
            size={size}
            className={
              star <= value
                ? 'fill-amber-400 text-amber-400'
                : 'text-zinc-700 hover:text-zinc-500'
            }
          />
        </button>
      ))}
    </div>
  );
};
