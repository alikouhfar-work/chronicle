import { env } from '@/infra/env';
import { NextResponse } from 'next/server';
import { prisma } from '@/infra/db/prisma';
import { COMMENT_ATTACHMENT_PREFIX, getCommentStorage } from '@/infra/storage/storage';
import { planAttachmentSweep } from '@/modules/comments/lib/planAttachmentSweep';
import { logError, logInfo } from '@/infra/logging/logger';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Orphan sweep for comment attachments. Call it from a cron with the same
 * `CRON_SECRET` bearer used by the demo reset:
 *
 *   GET /api/maintenance/attachments  Authorization: Bearer <CRON_SECRET>
 *
 * Deletes objects under `comment-attachments/` that no row references and that
 * are older than the 24 h grace window (an upload can outlive the composer that
 * requested it for a few minutes). Deletion is the only destructive action and
 * is limited to objects this deployment minted.
 */
export const GET = async (request: Request) => {
  const secret = env.cronSecret;
  const authorization = request.headers.get('authorization');

  if (!secret || authorization !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const storage = getCommentStorage();
    const [objects, rows] = await Promise.all([
      storage.list(`${COMMENT_ATTACHMENT_PREFIX}/`),
      prisma.commentAttachment.findMany({ select: { storageKey: true } }),
    ]);

    const referencedKeys = new Set(rows.map((row) => row.storageKey));
    const orphans = planAttachmentSweep({
      objects,
      referencedKeys,
      now: new Date(),
    });

    for (const key of orphans) {
      await storage.remove(key);
    }

    logInfo({
      event: 'maintenance.attachments.swept',
      meta: { scanned: objects.length, referenced: referencedKeys.size, deleted: orphans.length },
    });

    return NextResponse.json({
      ok: true,
      storage: storage.kind,
      scanned: objects.length,
      referenced: referencedKeys.size,
      deleted: orphans.length,
    });
  } catch (error) {
    logError({ event: 'maintenance.attachments', route: '/api/maintenance/attachments', error });
    return NextResponse.json({ ok: false, error: 'Sweep failed.' }, { status: 500 });
  }
};
