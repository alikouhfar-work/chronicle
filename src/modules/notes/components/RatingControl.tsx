'use client';

import { useEffect, useState } from 'react';
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
  /**
   * `panel` is the notes tab (label row plus the "notes stay independent"
   * copy); `compact` is the details header, where the same control has to sit
   * next to the tracking switch without a paragraph of its own.
   */
  variant?: 'panel' | 'compact';
};

/**
 * Rating lives on its own: clicking a star writes the tracking rating and
 * never creates, edits, or deletes a note. Shows have no rating — episode and
 * film only (decision D1) — so the callers label the scope explicitly.
 */
export const RatingControl = ({
  mediaType,
  targetId,
  value,
  label,
  variant = 'panel',
}: RatingControlProps) => {
  const [rating, setRating] = useState<number | null>(value);
  const [saving, setSaving] = useState(false);

  // A rating can be written from two places (header and notes tab) and the
  // server revalidates the page, so follow the prop once it lands. The scoped
  // disable is deliberate: `react-hooks/set-state-in-effect` wants a render
  // phase derivation, which cannot express "adopt a prop that arrives later"
  // without remounting or losing the optimistic value mid-save.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setRating(value), [value]);

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

  const stars = (
    <div
      className={
        variant === 'compact'
          ? 'flex w-fit items-center gap-1 rounded-full border border-white/10 bg-zinc-900 px-2 py-1'
          : 'flex w-fit items-center gap-1.5 rounded-full border border-white/10 bg-zinc-900 p-1.5'
      }
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
            aria-label={
              filled && rating === star ? `Clear rating (${star} of 5)` : `Rate ${star} of 5`
            }
            aria-pressed={filled}
            onClick={() => void apply(rating === star ? null : star)}
            className="cursor-pointer rounded-full p-0.5 transition-transform hover:scale-110 disabled:cursor-wait disabled:opacity-60 motion-reduce:transition-none motion-reduce:hover:scale-100"
          >
            <IconStar
              aria-hidden
              size={variant === 'compact' ? 16 : 18}
              className={
                filled ? 'fill-amber-400 text-amber-400' : 'text-zinc-700 hover:text-zinc-500'
              }
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
  );

  if (variant === 'compact') {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[10px] font-semibold tracking-wider text-zinc-400 uppercase">
          {label}
        </span>
        {stars}
        <span className="text-[11px] font-bold text-amber-300">
          {rating ? `${rating} / 5` : 'Not rated'}
        </span>
      </div>
    );
  }

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

      {stars}
      <p className="text-[11px] text-zinc-400">
        Rate {mediaType === 'movie' ? 'this movie' : 'this episode'} on its own — notes stay
        independent.
      </p>
    </div>
  );
};
