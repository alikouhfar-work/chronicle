import type { ShowTrackingStatus } from '../../../../generated/prisma/enums';

export type ShowStatusFilter = {
  key: ShowTrackingStatus;
  title: string;
};
