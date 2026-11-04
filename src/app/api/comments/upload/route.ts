import { randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';
import { requireUserId } from '@/infra/tmdb/forUser';
import {
  COMMENT_MAX_ATTACHMENT_SIZE_BYTES,
  COMMENT_STORAGE_MIME_TYPES,
  storage,
} from '@/infra/storage/storage';

const EXTENSION_BY_MIME: Record<(typeof COMMENT_STORAGE_MIME_TYPES)[number], string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

import type { UploadPayload } from '@/modules/comments/types/uploadPayload';
const readPayload = async (request: Request): Promise<UploadPayload | { error: string }> => {
  const requestContentType = request.headers.get('content-type') ?? '';

  if (requestContentType.includes('multipart/form-data')) {
    const formData = await request.formData();
    const file = formData.get('file');
    if (!(file instanceof File)) {
      return { error: 'A file is required.' };
    }

    return {
      buffer: Buffer.from(await file.arrayBuffer()),
      fileName: file.name || 'upload',
      contentType: file.type,
    };
  }

  // Raw-body upload. Kept for backwards compatibility with older clients
  // that passed file metadata as query parameters.
  const url = new URL(request.url);
  return {
    buffer: Buffer.from(await request.arrayBuffer()),
    fileName: url.searchParams.get('fileName') ?? 'upload',
    contentType: url.searchParams.get('contentType') ?? '',
  };
};

export const POST = async (request: Request) => {
  try {
    await requireUserId();
  } catch {
    return NextResponse.json({ ok: false, error: 'Sign in to upload images.' }, { status: 401 });
  }

  try {
    const payload = await readPayload(request);
    if ('error' in payload) {
      return NextResponse.json({ ok: false, error: payload.error }, { status: 400 });
    }

    const { buffer, fileName, contentType } = payload;

    if (
      !COMMENT_STORAGE_MIME_TYPES.includes(
        contentType as (typeof COMMENT_STORAGE_MIME_TYPES)[number],
      )
    ) {
      return NextResponse.json(
        { ok: false, error: 'Unsupported image type. Allowed: jpeg, png, webp.' },
        { status: 400 },
      );
    }

    if (buffer.length === 0) {
      return NextResponse.json(
        { ok: false, error: 'The uploaded file is empty.' },
        { status: 400 },
      );
    }

    if (buffer.length > COMMENT_MAX_ATTACHMENT_SIZE_BYTES) {
      return NextResponse.json(
        { ok: false, error: 'Image too large. Maximum size is 5MB.' },
        { status: 400 },
      );
    }

    const extension = EXTENSION_BY_MIME[contentType as keyof typeof EXTENSION_BY_MIME];
    const baseName = fileName
      .replace(/\.[^.]+$/, '')
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 48);
    const storageKey = `comment-attachments/${Date.now()}-${randomUUID()}-${baseName || 'image'}.${extension}`;

    await storage.writeBuffer(storageKey, buffer);

    return NextResponse.json({
      ok: true,
      key: storageKey,
      url: storage.publicUrl(storageKey),
      mimeType: contentType,
      sizeBytes: buffer.length,
    });
  } catch (error) {
    console.error('comment upload error:', error);
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Upload failed.' },
      { status: 500 },
    );
  }
};
