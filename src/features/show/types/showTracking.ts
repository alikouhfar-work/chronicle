import { ShowTrackingStatus } from '../../../../generated/prisma/enums';

export type ShowTracking = {
  id: string;
  status: ShowTrackingStatus;
  addedAt: Date;
  startedAt: Date | null;
};