'use server';

import { prisma } from '@/infra/db/prisma';
import { requireUserId } from '@/infra/tmdb/forUser';
import {
  COMMENT_MAX_ATTACHMENT_SIZE_BYTES,
  COMMENT_MAX_ATTACHMENTS_PER_COMMENT,
  COMMENT_STORAGE_MIME_TYPES,
  isCommentAttachmentUrl,
} from '@/infra/storage/storage';
import { publicUserSelect } from '@/modules/user/lib/publicUser';
import { toCommentView } from '@/modules/comments/lib/toCommentView';
import { extractMentionHandles } from '@/modules/comments/lib/mentions';
import { getUserMediaName } from '@/modules/comments/services/getUserMediaName';
import { resolveMentionUsers } from '@/modules/comments/services/resolveMentionUsers';
import { PRISMA_MEDIA_TYPE, isCommentMediaType, isTmdbId } from '@/modules/comments/lib/validation';
import { COMMENT_MAX_LENGTH, COMMENT_MIN_LENGTH } from '@/modules/comments/constants';
import type { CommentAttachmentInput, CreateCommentResult } from '@/modules/comments/types';
import type { CreateCommentInput } from '@/modules/comments/types/createComment';
import { logError } from '@/infra/logging/logger';

const isValidAttachment = (attachment: CommentAttachmentInput): boolean =>
  isCommentAttachmentUrl(attachment?.url) &&
  typeof attachment.mimeType === 'string' &&
  COMMENT_STORAGE_MIME_TYPES.includes(
    attachment.mimeType as (typeof COMMENT_STORAGE_MIME_TYPES)[number],
  ) &&
  Number.isFinite(attachment.sizeBytes) &&
  attachment.sizeBytes > 0 &&
  attachment.sizeBytes <= COMMENT_MAX_ATTACHMENT_SIZE_BYTES;

export const createComment = async (
  _prevState: unknown,
  input: CreateCommentInput,
): Promise<CreateCommentResult> => {
  let userId: string;
  try {
    userId = await requireUserId();
  } catch {
    return { success: false, error: 'You must be signed in to comment.' };
  }

  if (!isCommentMediaType(input?.mediaType)) {
    return { success: false, error: 'Unknown media type.' };
  }

  const tmdbId = input.tmdbId;
  if (!isTmdbId(tmdbId)) {
    return { success: false, error: 'Missing media TMDB id.' };
  }

  const content = (input.content ?? '').trim();
  if (content.length < COMMENT_MIN_LENGTH || content.length > COMMENT_MAX_LENGTH) {
    return {
      success: false,
      error: `Comment must be between ${COMMENT_MIN_LENGTH} and ${COMMENT_MAX_LENGTH} characters.`,
    };
  }

  const attachments = input.attachments ?? [];
  if (attachments.length > COMMENT_MAX_ATTACHMENTS_PER_COMMENT) {
    return {
      success: false,
      error: `Maximum of ${COMMENT_MAX_ATTACHMENTS_PER_COMMENT} attachments allowed.`,
    };
  }

  if (!attachments.every(isValidAttachment)) {
    return { success: false, error: 'One or more attachments are invalid.' };
  }

  try {
    const mediaTitle = await getUserMediaName(userId, input.mediaType, tmdbId);
    if (!mediaTitle) {
      return { success: false, error: 'This title is not in your library anymore.' };
    }

    // Resolve every handle with one lookup. Never use client-supplied IDs to
    // decide which users are mentioned.
    const mentionedUsers = await resolveMentionUsers(extractMentionHandles(content));
    const mentionRows = mentionedUsers.map((mentionedUser) => ({
      mentionedUserId: mentionedUser.id,
    }));
    const notificationRows = mentionedUsers
      .filter((mentionedUser) => mentionedUser.id !== userId)
      .map((mentionedUser) => ({
        recipientId: mentionedUser.id,
        actorId: userId,
        type: 'COMMENT_MENTION' as const,
        // Snapshot the media reference at creation time: notifications keep
        // rendering after the media leaves every library.
        mediaType: PRISMA_MEDIA_TYPE[input.mediaType],
        tmdbId,
        mediaTitle,
      }));

    const comment = await prisma.comment.create({
      data: {
        userId,
        content,
        mediaType: PRISMA_MEDIA_TYPE[input.mediaType],
        tmdbId,
        // Set explicitly instead of relying on the DB default: production
        // databases are UTC, but local Postgres instances often are not and
        // the column is `timestamp without time zone`.
        createdAt: new Date(),
        attachments:
          attachments.length > 0
            ? {
                create: attachments.map((attachment) => ({
                  url: attachment.url,
                  mimeType: attachment.mimeType,
                  sizeBytes: attachment.sizeBytes,
                  width: attachment.width ?? null,
                  height: attachment.height ?? null,
                })),
              }
            : undefined,
        mentions:
          mentionRows.length > 0
            ? { createMany: { data: mentionRows } }
            : undefined,
        notifications:
          notificationRows.length > 0
            ? { createMany: { data: notificationRows } }
            : undefined,
      },
      include: {
        user: { select: publicUserSelect },
        attachments: {
          select: { id: true, url: true, mimeType: true, width: true, height: true },
        },
      },
    });

    return { success: true, comment: toCommentView(comment) };
  } catch (error) {
    logError({ event: 'comment.create', action: 'createComment', error });
    return { success: false, error: 'Could not create comment.' };
  }
};
