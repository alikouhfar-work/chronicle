export type RewatchMediaType = 'episode' | 'season' | 'show' | 'movie';

export type RewatchButtonProps = {
  mediaType: RewatchMediaType;
  mediaId: string;
  initialCount: number;
  /** Already watched through tracking (a completed movie/show/season) even with 0 logged watches. */
  watched?: boolean;
  historyTitle?: string;
  variant?: 'pill' | 'compact';
  fullWidth?: boolean;
  className?: string;
};

export type RewatchHistoryButtonProps = {
  mediaType: RewatchMediaType;
  mediaId: string;
  title: string;
  count?: number;
  className?: string;
};

export type RewatchHistoryModalProps = {
  mediaType: RewatchMediaType;
  mediaId: string;
  title: string;
  initialCount: number;
  onCountChange?: (count: number) => void;
  onClose: () => void;
};

export type RewatchHistoryEntry = {
  id: string;
  rewatchedAt: string;
};

export type RewatchActionFailure = {
  success: false;
  error: string;
};

export type AddRewatchActionResult =
  | {
      success: true;
      rewatchCount: number;
      logId: string;
      rewatchedAt: string;
    }
  | RewatchActionFailure;

export type UpdateRewatchActionResult =
  | {
      success: true;
      logId: string;
      rewatchedAt: string;
    }
  | RewatchActionFailure;

export type RemoveRewatchActionResult =
  | {
      success: true;
      rewatchCount: number;
      removedLogs: number;
      /** Undo token for `undoUnwatch`; null when nothing was recorded. */
      undoToken: string | null;
    }
  | RewatchActionFailure;

export type UndoUnwatchActionResult =
  | {
      success: true;
      rewatchCount: number;
      mediaType: RewatchMediaType;
      mediaId: string;
    }
  | RewatchActionFailure;

export type GetRewatchHistoryActionResult =
  | {
      success: true;
      rewatchCount: number;
      history: RewatchHistoryEntry[];
    }
  | RewatchActionFailure;

export type RecordRewatchResult = {
  mediaType: RewatchMediaType;
  mediaId: string;
  tmdbId: number;
  rewatchCount: number;
  logId: string;
  rewatchedAt: Date;
};

export type RemoveRewatchResult = {
  mediaType: RewatchMediaType;
  mediaId: string;
  tmdbId: number | null;
  rewatchCount: number;
  /** How many log rows the operation deleted, including cascaded children. */
  removedLogs: number;
  /** Token that restores this removal while the undo window is open. */
  undoToken: string;
};

export type RestoreRemovalResult = {
  mediaType: RewatchMediaType;
  mediaId: string;
  tmdbId: number;
  rewatchCount: number;
};

export type RewatchHistoryResult = {
  mediaType: RewatchMediaType;
  mediaId: string;
  rewatchCount: number;
  history: Array<{
    id: string;
    rewatchedAt: Date;
  }>;
};
