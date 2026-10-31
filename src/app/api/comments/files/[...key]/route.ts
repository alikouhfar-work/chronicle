import { NextResponse } from 'next/server';
import { storage } from '@/infra/storage/storage';

const MIME_BY_EXTENSION: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
};

export const runtime = 'nodejs';

export const GET = async (
  _request: Request,
  { params }: { params: Promise<{ key: string[] }> },
) => {
  const { key } = await params;

  if (!key?.length || key.some((segment) => segment === '..' || segment.includes('\0'))) {
    return NextResponse.json({ error: 'Not found.' }, { status: 404 });
  }

  const storageKey = key.join('/');
  if (!storageKey.startsWith('comment-attachments/')) {
    return NextResponse.json({ error: 'Not found.' }, { status: 404 });
  }

  try {
    const buffer = await storage.readBuffer(storageKey);
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
