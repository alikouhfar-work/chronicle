'use client';

import { useState } from 'react';
import { IconLoader2, IconStar } from '@tabler/icons-react';
import { setMediaRating } from '@/modules/media/actions/setMediaRating';
import type { MediaRatingTarget } from '@/modules/media/types/mediaRating';
import { toastError } from '@/shared/lib/toast';

const STARS = [1, 2, 3, 4, 5];

type RatingControlProps = {
  mediaType: MediaRatingTarget;
  targetId: string;
  value: number | null;
  label: string;
};

/**
 * Rating lives on its own: clicking a star writes the tracking rating and
 * never creates, edits, or deletes a note.
 */
export const RatingControl = ({ mediaType, targetId, value, label }: RatingControlProps) => {
  const [rating, setRating] = useState<number | null>(value);
  const [saving, setSaving] = useState(false);

  const apply = async (next: number | null) => {
    if (saving) return;

    const previous = rating;
    setRating(next);
    setSaving(true);

    const result = await setMediaRating({ mediaType, id: targetId, rating: next });
    setSaving(false);

    if (!result.success) {
      setRating(previous);
      toastError(result.error, 'Couldn’t save your rating.');
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <span className="text-[10px] font-semibold tracking-wider text-zinc-400 uppercase">
          {label}
        </span>
        <span className="text-[11px] font-bold text-amber-300">
          {rating ? `${rating} / 5` : 'Not rated'}
        </span>
      </div>

      <div
        className="flex w-fit items-center gap-1.5 rounded-full border border-white/10 bg-zinc-900 p-1.5"
        role="group"
        aria-label={label}
        aria-busy={saving || undefined}
      >
        {STARS.map((star) => {
          const filled = rating !== null && star <= rating;
          return (
            <button
              key={star}
              type="button"
              disabled={saving}
              aria-label={filled && rating === star ? `Clear rating (${star} of 5)` : `Rate ${star} of 5`}
              aria-pressed={filled}
              onClick={() => void apply(rating === star ? null : star)}
              className="cursor-pointer rounded-full p-0.5 transition-transform hover:scale-110 disabled:cursor-wait disabled:opacity-60 motion-reduce:transition-none motion-reduce:hover:scale-100"
            >
              <IconStar
                aria-hidden
                size={18}
                className={filled ? 'fill-amber-400 text-amber-400' : 'text-zinc-700 hover:text-zinc-500'}
              />
            </button>
          );
        })}
        {saving && (
          <IconLoader2
            size={13}
            aria-hidden
            className="ml-1 animate-spin text-violet-300 motion-reduce:animate-none"
          />
        )}
      </div>
      <p className="text-[11px] text-zinc-400">
        Rate {mediaType === 'movie' ? 'this movie' : 'this episode'} on its own — notes stay
        independent.
      </p>
    </div>
  );
};
