import type { FilesRouteContext } from '@/modules/api/types/routeContext';
import { NextResponse } from 'next/server';
import { getCommentStorage, isCommentAttachmentKey } from '@/infra/storage/storage';

const MIME_BY_EXTENSION: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
};

export const runtime = 'nodejs';

/**
 * Streams a stored attachment. With object storage configured the rendered URL
 * points at the bucket/CDN directly; this route then only serves the local-disk
 * development backend and pre-S3 rows.
 */
export const GET = async (_request: Request, { params }: FilesRouteContext) => {
  const { key } = await params;

  if (!key?.length || key.some((segment) => segment === '..' || segment.includes('\0'))) {
    return NextResponse.json({ error: 'Not found.' }, { status: 404 });
  }

  const storageKey = key.join('/');
  if (!isCommentAttachmentKey(storageKey)) {
    return NextResponse.json({ error: 'Not found.' }, { status: 404 });
  }

  try {
    const buffer = await getCommentStorage().readBuffer(storageKey);
    const extension = storageKey.split('.').pop()?.toLowerCase() ?? '';

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': MIME_BY_EXTENSION[extension] ?? 'application/octet-stream',
        'Content-Length': String(buffer.length),
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Not found.' }, { status: 404 });
  }
};
