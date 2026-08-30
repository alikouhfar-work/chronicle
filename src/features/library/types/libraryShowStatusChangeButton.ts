import { ShowStatusFilter } from '@/features/show/types/showStatusFilter';
import { ShowTrackingStatus } from '../../../../generated/prisma/enums';

export type LibraryShowStatusChangeButtonProps = {
  showId: string;
  statusFilter: ShowStatusFilter;
  showStatus?: ShowTrackingStatus;
};