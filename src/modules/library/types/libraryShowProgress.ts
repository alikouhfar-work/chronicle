import type { Season } from '@/modules/episode-season';
import type { ShowLifecycle } from '@/modules/show/types/showLifecycle';

export type LibraryShowProgressProps = {
  seasons: Season[];
  lifecycle: ShowLifecycle | null;
  trackingStatus?: string;
};
