import { EmptyState } from '@/shared/ui/EmptyState';
import type { UpcomingMediaEmptyProps } from '@/shared/types/upcoming';

export const UpcomingMediaEmpty = ({
  icon: Icon,
  title,
  subTitle,
}: UpcomingMediaEmptyProps) => (
  <EmptyState icon={Icon} title={title} description={subTitle} />
);

