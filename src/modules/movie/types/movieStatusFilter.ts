import { MovieTrackingStatus } from '../../../../generated/prisma/enums';

export type MovieStatusFilter = {
  key: MovieTrackingStatus;
  title: string;
};
