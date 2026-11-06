import { IconMovie } from '@tabler/icons-react';
import { EmptyState } from '@/shared/ui/EmptyState';

export const PersonDetailsFilmographyEmpty = () => (
  <EmptyState
    icon={IconMovie}
    title="No matching works found"
    description="Try adjusting your filter or search keywords."
  />
);

