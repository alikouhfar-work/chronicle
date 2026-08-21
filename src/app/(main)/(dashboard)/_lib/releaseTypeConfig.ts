export const releaseTypeConfig = {
  new_season: {
    label: 'New Season',
    className: 'text-zinc-300 bg-zinc-900/80 border-zinc-800/80',
    glow: 'from-zinc-500/5 to-transparent',
    hover: 'hover:border-zinc-750',
  },
  new_episode: {
    label: 'New Episode',
    className: 'text-zinc-300 bg-zinc-900/80 border-zinc-800/80',
    glow: 'from-zinc-500/5 to-transparent',
    hover: 'hover:border-zinc-750',
  },
  sequel: {
    label: 'Sequel Film',
    className: 'text-zinc-300 bg-zinc-900/80 border-zinc-800/80',
    glow: 'from-zinc-500/5 to-transparent',
    hover: 'hover:border-zinc-750',
  },
  spin_off: {
    label: 'Spinoff Series',
    className: 'text-zinc-300 bg-zinc-900/80 border-zinc-800/80',
    glow: 'from-zinc-500/5 to-transparent',
    hover: 'hover:border-zinc-750',
  },
  default: {
    label: 'Release',
    className: 'text-zinc-400 bg-zinc-900/80 border-zinc-800/80',
    glow: 'from-zinc-500/5 to-transparent',
    hover: 'hover:border-zinc-800',
  },
} as const;

