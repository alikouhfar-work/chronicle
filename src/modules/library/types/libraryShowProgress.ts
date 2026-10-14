import { Season } from '@/modules/episode-season';
import type { ShowLifecycle } from '@/modules/show/lib/showLifecycle';

export type LibraryShowProgressProps = {
  seasons: Season[];
  numberOfEpisodes: number;
  lifecycle: ShowLifecycle | null;
};
