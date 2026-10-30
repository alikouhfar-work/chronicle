'use action';

import { prisma } from '@/infra/db/prisma';
import { requireUserId } from '@/infra/tmdb/forUser';

export type CreateCommentResult = {
  success: boolean;
  error?: string;
};

export type CreateCommentInput = {
  mediaType: string;
  mediaId: string;
  content: string;
  attachmentIds?: string[];
};

export const createComment = async (
  _prevState: unknown,
  input: CreateCommentInput,
): Promise<CreateCommentResult> => {
  const userId = await requireUserId();
  if (!userId) {
    return { success: false, error: 'You must be signed in to comment.' };
  }

  const content = (input.content ?? '').trim();
  if (content.length < 1 || content.length > 2000) {
    return { success: false, error: 'Comment must be between 1 and 2000 characters.' };
  }

  // Validate attachment count.
  const attachmentIds = input.attachmentIds ?? [];
  if (attachmentIds.length > 4) {
    return { success: false, error: 'Maximum of 4 attachments allowed.' };
  }

  // Validate attachments belong to this comment flow.
  if (attachmentIds.length > 0) {
    const attachments = await prisma.commentAttachment.findMany({
      where: { id: { in: attachmentIds }, comment: { mediaType: input.mediaType as never, mediaId: input.mediaId } },
    });
    if (attachments.length !== attachmentIds.length) {
      return { success: false, error: 'One or more attachments are invalid.' };
    }
  }

  try {
    const comment = await prisma.comment.create({
      data: {
        userId,
        content,
        mediaType: input.mediaType as never,
        mediaId: input.mediaId,
      },
    });

    // Attach verified attachments.
    if (attachmentIds.length > 0) {
      await prisma.commentAttachment.updateMany({
        where: { id: { in: attachmentIds } },
        data: { commentId: comment.id },
      });
    }

    return { success: true };
  } catch (error) {
    console.error('createComment error:', error);
    return { success: false, error: 'Could not create comment.' };
  }
};
