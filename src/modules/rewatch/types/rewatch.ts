export type RewatchMediaType = 'episode' | 'season' | 'show' | 'movie';

export type RewatchButtonProps = {
  mediaType: RewatchMediaType;
  mediaId: string;
  initialCount: number;
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

export type RemoveRewatchActionResult =
  | {
      success: true;
      rewatchCount: number;
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
