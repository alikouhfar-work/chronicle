'use server';

import { prisma } from '@/infra/db/prisma';
import { requireUserId } from '@/infra/tmdb/forUser';
import { publicUserSelect } from '@/modules/user/lib/publicUser';
import { toCommentView } from '@/modules/comments/lib/toCommentView';
import { extractMentionHandles } from '@/modules/comments/lib/mentions';
import { APP_MEDIA_TYPE } from '@/modules/comments/lib/validation';
import { getUserMediaName } from '@/modules/comments/services/getUserMediaName';
import { resolveMentionUsers } from '@/modules/comments/services/resolveMentionUsers';
import { COMMENT_MAX_LENGTH, COMMENT_MIN_LENGTH } from '@/modules/comments/constants';
import type { UpdateCommentResult } from '@/modules/comments/types';
import type { UpdateCommentInput } from '@/modules/comments/types/updateComment';
import { logError } from '@/infra/logging/logger';
import { revalidateUnreadCount } from '@/modules/notifications/services/countUnreadNotifications';

type CommentMediaRow = {
  userId: string;
  /** Prisma enum name, as stored. */
  mediaType: 'MOVIE' | 'SHOW' | 'EPISODE';
  tmdbId: number;
};

export const updateComment = async (
  commentId: string,
  input: UpdateCommentInput,
): Promise<UpdateCommentResult> => {
  let userId: string;
  try {
    userId = await requireUserId();
  } catch {
    return { success: false, error: 'You must be signed in to edit comments.' };
  }

  const comment = (await prisma.comment.findUnique({
    where: { id: commentId },
    select: { userId: true, mediaType: true, tmdbId: true },
  })) as CommentMediaRow | null;

  if (!comment) {
    return { success: false, error: 'Comment not found.' };
  }

  if (comment.userId !== userId) {
    return { success: false, error: 'You are not the author of this comment.' };
  }

  const content = (input?.content ?? '').trim();
  if (content.length < COMMENT_MIN_LENGTH || content.length > COMMENT_MAX_LENGTH) {
    return {
      success: false,
      error: `Comment must be between ${COMMENT_MIN_LENGTH} and ${COMMENT_MAX_LENGTH} characters.`,
    };
  }

  try {
    // Mentions are re-derived from the stored content, exactly like creation:
    // an edit must not leave stale CommentMention/Notification rows behind.
    const mentionedUsers = await resolveMentionUsers(extractMentionHandles(content));
    const recipients = mentionedUsers.filter((mentionedUser) => mentionedUser.id !== userId);

    const existingNotification = await prisma.notification.findFirst({
      where: { commentId },
      select: { mediaTitle: true },
    });
    const mediaTitle =
      existingNotification?.mediaTitle ||
      (await getUserMediaName(userId, APP_MEDIA_TYPE[comment.mediaType], comment.tmdbId)) ||
      '';

    const updated = await prisma.$transaction(async (tx) => {
      await tx.commentMention.deleteMany({ where: { commentId } });
      if (mentionedUsers.length > 0) {
        await tx.commentMention.createMany({
          data: mentionedUsers.map((mentionedUser) => ({
            commentId,
            mentionedUserId: mentionedUser.id,
          })),
        });
      }

      // Drop notifications for handles that were removed from the text; the
      // @@unique([recipientId, commentId]) pair keeps the rest stable.
      const recipientIds = recipients.map((recipient) => recipient.id);
      await tx.notification.deleteMany({
        where: { commentId, recipientId: { notIn: recipientIds } },
      });
      if (recipients.length > 0) {
        await tx.notification.createMany({
          data: recipients.map((recipient) => ({
            recipientId: recipient.id,
            actorId: userId,
            type: 'COMMENT_MENTION' as const,
            commentId,
            mediaType: comment.mediaType,
            tmdbId: comment.tmdbId,
            mediaTitle,
          })),
          skipDuplicates: true,
        });
      }

      return tx.comment.update({
        where: { id: commentId },
        data: { content },
        include: {
          user: { select: publicUserSelect },
          attachments: {
            select: { id: true, url: true, mimeType: true, width: true, height: true },
          },
        },
      });
    });

    // Editing can add or remove mentions, which adds or removes the recipients'
    // unread rows.
    revalidateUnreadCount();
    return { success: true, comment: toCommentView(updated) };
  } catch (error) {
    logError({ event: 'comment.update', action: 'updateComment', error });
    return { success: false, error: 'Could not update comment.' };
  }
};
