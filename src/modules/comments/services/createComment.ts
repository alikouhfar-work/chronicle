'use action';

import { prisma } from '@/infra/db/prisma';
import { requireUserId } from '@/infra/tmdb/forUser';

export type CreateCommentResult = {
  success: boolean;
  error?: string;
};

export const createComment = async (
  _prevState: unknown,
  formData: FormData,
): Promise<CreateCommentResult> => {
  const userId = await requireUserId();
  if (!userId) {
    return { success: false, error: 'You must be signed in to comment.' };
  }

  const content = (formData.get('content') as string).trim();
  if (content.length < 1 || content.length > 2000) {
    return { success: false, error: 'Comment must be between 1 and 2000 characters.' };
  }

  const mediaType = (formData.get('mediaType') as string) as 'episode' | 'show' | 'movie';
  const mediaId = formData.get('mediaId') as string;

  // Handle attachments (up to 4)
  const attachmentUrls: string[] = [];
  for (let i = 0; i < 4; i += 1) {
    const url = formData.get(`attachment${i}`) as string;
    if (url && typeof url === 'string' && url.trim()) {
      attachmentUrls.push(url.trim());
    }
  }

  if (attachmentUrls.length > 4) {
    return { success: false, error: 'Maximum of 4 attachments allowed.' };
  }

  // Reject attachments already claimed by another comment
  if (attachmentUrls.length > 0) {
    const existing = await prisma.commentAttachment.findMany({
      where: { url: { in: attachmentUrls } },
    });
    const claimedUrls = new Set(existing.map((a) => a.url));
    const duplicateUrls = attachmentUrls.filter((u) => claimedUrls.has(u));
    if (duplicateUrls.length > 0) {
      return { success: false, error: 'One or more attachments are already claimed.' };
    }
  }

  try {
    await prisma.comment.create({
      data: {
        userId,
        content,
        mediaType,
        mediaId,
        attachments: {
          create: attachmentUrls.map((url) => ({ url })),
        },
      } as never,
    });
  } catch (error) {
    console.error('createComment error:', error);
    return { success: false, error: 'Could not create comment.' };
  }

  return { success: true };
};