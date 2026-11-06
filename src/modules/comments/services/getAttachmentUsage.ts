import 'server-only';

import { prisma } from '@/infra/db/prisma';

export type AttachmentUsage = {
  totalBytes: number;
  uploadsLastDay: number;
};

/** Per-account attachment footprint, used to enforce the upload quota. */
export const getAttachmentUsage = async (userId: string): Promise<AttachmentUsage> => {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const [aggregate, uploadsLastDay] = await Promise.all([
    prisma.commentAttachment.aggregate({
      _sum: { sizeBytes: true },
      where: { comment: { userId } },
    }),
    prisma.commentAttachment.count({
      where: { comment: { userId }, createdAt: { gte: since } },
    }),
  ]);

  return { totalBytes: aggregate._sum.sizeBytes ?? 0, uploadsLastDay };
};
