import { NextResponse } from 'next/server';
import { prisma } from '@/infra/db/prisma';
import { requireUserId } from '@/infra/tmdb/forUser';
import {
  COMMENT_MAX_ATTACHMENTS_PER_COMMENT,
  COMMENT_STORAGE_MIME_TYPES,
  getCommentStorage,
  isCommentAttachmentKey,
} from '@/infra/storage/storage';
import type { CommentMimeType } from '@/modules/comments/types/commentMimeType';

/**
 * Registers an already-uploaded object as a comment attachment. The URL is
 * derived from the storage key server-side — never accepted from the client —
 * and the object must exist in this deployment's bucket.
 */
export const POST = async (request: Request) => {
  try {
    const userId = await requireUserId();

    const body = (await request.json().catch(() => null)) as {
      commentId?: string;
      key?: string;
      mimeType?: string;
      sizeBytes?: number;
    } | null;

    if (!body?.commentId || !isCommentAttachmentKey(body.key) || !body?.mimeType) {
      return NextResponse.json(
        { ok: false, error: 'commentId, key, and mimeType are required.' },
        { status: 400 },
      );
    }

    if (!COMMENT_STORAGE_MIME_TYPES.includes(body.mimeType as CommentMimeType)) {
      return NextResponse.json(
        { ok: false, error: 'Unsupported image type. Allowed: jpeg, png, webp.' },
        { status: 400 },
      );
    }

    const storage = getCommentStorage();
    if (!(await storage.exists(body.key))) {
      return NextResponse.json(
        { ok: false, error: 'Upload not found. Upload the image again.' },
        { status: 400 },
      );
    }

    // Check comment ownership.
    const comment = await prisma.comment.findUnique({
      where: { id: body.commentId },
      select: { userId: true, attachments: { select: { id: true } } },
    });

    if (!comment) {
      return NextResponse.json(
        { ok: false, error: 'Comment not found.' },
        { status: 404 },
      );
    }

    if (comment.userId !== userId) {
      return NextResponse.json(
        { ok: false, error: 'You are not the author of this comment.' },
        { status: 403 },
      );
    }

    if (comment.attachments.length >= COMMENT_MAX_ATTACHMENTS_PER_COMMENT) {
      return NextResponse.json(
        { ok: false, error: `Maximum of ${COMMENT_MAX_ATTACHMENTS_PER_COMMENT} attachments per comment.` },
        { status: 400 },
      );
    }

    const attachment = await prisma.commentAttachment.create({
      data: {
        commentId: body.commentId,
        url: storage.publicUrl(body.key),
        mimeType: body.mimeType,
        sizeBytes: body.sizeBytes ?? 0,
      },
    });

    return NextResponse.json(
      {
        ok: true,
        attachment: { id: attachment.id, url: attachment.url, mimeType: attachment.mimeType },
      },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Could not attach comment.' },
      { status: 500 },
    );
  }
};
