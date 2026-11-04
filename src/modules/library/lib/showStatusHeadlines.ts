/**
 * Randomized headline pools per tracking status. Runtime data, so it lives
 * in `lib/` — `types/showStatus.ts` derives `ShowStatusKey` from it.
 */
export const STATUS_HEADLINES = {
  PLAN_TO_WATCH: ['On hold ⏳', 'Back burner 🔥'],
  WATCHING: ['Binging 🍿', 'Obsessed 👁️👁️'],
  COMPLETED: ['Next season waiting ⏳'],
  DROPPED: ['Ghosted 👻', 'Dropped 🪦', 'Gave up 💔'],
} as const;

// COMPLETED + ended gets its own headline: the user finished a finished
// show, which is different from merely reaching the finale untracked.
export const COMPLETED_ENDED_HEADLINE = 'Conquered 🏆';
