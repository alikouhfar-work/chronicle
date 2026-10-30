import { NextResponse } from 'next/server';
import { storage, COMMENT_MAX_ATTACHMENT_SIZE_BYTES, COMMENT_STORAGE_MIME_TYPES } from '@/infra/storage/storage';

export const POST = async (request: Request) => {
  try {
    const url = new URL(request.url);
    const fileName = url.searchParams.get('fileName') ?? 'upload';
    const contentType = url.searchParams.get('contentType') ?? 'image/png';
    const contentLength = Number(url.searchParams.get('contentLength') ?? 0);

    if (!COMMENT_STORAGE_MIME_TYPES.includes(contentType as (typeof COMMENT_STORAGE_MIME_TYPES)[number])) {
      return NextResponse.json(
        { ok: false, error: 'Unsupported image type. Allowed: jpeg, png, webp.' },
        { status: 400 },
      );
    }
    if (contentLength > COMMENT_MAX_ATTACHMENT_SIZE_BYTES) {
      return NextResponse.json(
        { ok: false, error: 'Image too large. Maximum size is 5MB.' },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await request.arrayBuffer());
    const storageKey = `comment-attachments/${Date.now()}-${fileName}`;
    await storage.writeBuffer(storageKey, buffer);

    return NextResponse.json({
      ok: true,
      key: storageKey,
      url: storage.publicUrl(storageKey),
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Upload failed.' },
      { status: 500 },
    );
  }
};
