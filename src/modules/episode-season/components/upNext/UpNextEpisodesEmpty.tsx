import { IconDeviceTv } from '@tabler/icons-react';
import { EmptyState } from '@/shared/ui/EmptyState';

export const UpNextEpisodesEmpty = () => (
  <EmptyState
    icon={IconDeviceTv}
    title="No episodes in progress"
    description='Add a show to your library and set its status to "Watching" to have your next episode appear here.'
  />
);

