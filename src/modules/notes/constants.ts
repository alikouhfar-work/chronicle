/** Notes are free-form: long enough for an essay, short enough to stay sane. */
export const NOTE_MAX_LENGTH = 5000;
export const NOTE_MIN_LENGTH = 1;
/** One page is plenty for a private notebook; no pagination UI is shipped. */
export const NOTE_PAGE_SIZE = 50;

/** The rating scale is 1-5 everywhere; the control and its tests share this. */
export const RATING_STARS = [1, 2, 3, 4, 5] as const;
