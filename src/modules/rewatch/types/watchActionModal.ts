import type { RewatchMediaType } from '@/modules/rewatch/types/rewatch';

/** Media kinds that can be watched/unwatched from the confirmation dialog. */
export type WatchActionMediaType = RewatchMediaType;

export type WatchActionModalProps = {
  mediaType: WatchActionMediaType;
  mediaId: string;
  /** Primary line, e.g. the movie, show, season, or episode name. */
  title: string;
  /** Secondary line, e.g. "Season 2" or "Episode 3 • The Rogue Prince". */
  subtitle?: string;
  watchCount: number;
  onRewatch: (count: number) => void;
  onUnwatch: (count: number) => void;
  onClose: () => void;
};

export type WatchActionPending = 'rewatch' | 'unwatch' | null;
