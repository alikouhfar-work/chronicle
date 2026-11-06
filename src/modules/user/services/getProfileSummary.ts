import 'server-only';

import { prisma } from '@/infra/db/prisma';
import type { ProfileSummary } from '@/modules/user/types/profileSummary';

export const getProfileSummary = async (userId: string): Promise<ProfileSummary | null> =>
  prisma.user.findUnique({
    where: { id: userId },
    select: { username: true, name: true, email: true, image: true },
  });
