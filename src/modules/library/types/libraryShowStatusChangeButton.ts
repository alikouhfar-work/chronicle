import type { ShowStatusFilter } from '@/modules/show/types/showStatusFilter';
import type { ShowTrackingStatus } from '../../../../generated/prisma/enums';

export type LibraryShowStatusChangeButtonProps = {
  showId: string;
  statusFilter: ShowStatusFilter;
  showStatus?: ShowTrackingStatus;
};