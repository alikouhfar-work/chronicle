import { NextResponse } from 'next/server';
import { requireUserId } from '@/infra/tmdb/forUser';
import { COMMENT_MAX_ATTACHMENT_SIZE_BYTES, getCommentStorage } from '@/infra/storage/storage';
import { buildCommentAttachmentKey } from '@/modules/comments/lib/attachmentKey';
import { readCappedBody } from '@/modules/comments/lib/readCappedBody';
import { sniffImageType } from '@/modules/comments/lib/sniffImageType';
import { logError } from '@/infra/logging/logger';

export const runtime = 'nodejs';

const MAX_BYTES = COMMENT_MAX_ATTACHMENT_SIZE_BYTES;

/** Attachments are served from a bucket or the file route; never sniffed by the browser. */
const NOSNIFF = { 'X-Content-Type-Options': 'nosniff' } as const;

const tooLarge = () =>
  NextResponse.json(
    { ok: false, error: 'Image too large. Maximum size is 5MB.' },
    { status: 413, headers: NOSNIFF },
  );

const declaredLength = (request: Request): number | null => {
  const header = request.headers.get('content-length');
  if (!header) return null;
  const parsed = Number(header);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
};

/**
 * Reads the upload without trusting either the size or the type the client
 * declares:
 * - a `Content-Length` over the cap is rejected before any body is read;
 * - the body itself is read through a hard byte cap, so a lying header cannot
 *   force the whole payload into memory;
 * - the image type comes from magic bytes, and the stored content type and key
 *   are derived from that, not from `file.type`.
 */
export const POST = async (request: Request) => {
  try {
    await requireUserId();
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Sign in to upload images.' },
      { status: 401, headers: NOSNIFF },
    );
  }

  const length = declaredLength(request);
  if (length !== null && length > MAX_BYTES) return tooLarge();

  try {
    const isMultipart = (request.headers.get('content-type') ?? '').includes(
      'multipart/form-data',
    );

    let bytes: Uint8Array | null;
    let fileName: string;

    if (isMultipart) {
      // formData() cannot be streamed through a cap, so the length pre-check
      // above is the guard here; the buffer is re-measured below.
      const formData = await request.formData();
      const file = formData.get('file');
      if (!(file instanceof File)) {
        return NextResponse.json(
          { ok: false, error: 'A file is required.' },
          { status: 400, headers: NOSNIFF },
        );
      }
      bytes = new Uint8Array(await file.arrayBuffer());
      fileName = file.name || 'upload';
    } else {
      bytes = await readCappedBody(request, MAX_BYTES);
      const url = new URL(request.url);
      fileName = url.searchParams.get('fileName') ?? 'upload';
      if (bytes === null) return tooLarge();
    }

    if (bytes.length === 0) {
      return NextResponse.json(
        { ok: false, error: 'The uploaded file is empty.' },
        { status: 400, headers: NOSNIFF },
      );
    }

    if (bytes.length > MAX_BYTES) return tooLarge();

    const mimeType = sniffImageType(bytes);
    if (!mimeType) {
      return NextResponse.json(
        { ok: false, error: 'That file is not a JPEG, PNG, or WebP image.' },
        { status: 415, headers: NOSNIFF },
      );
    }

    const storage = getCommentStorage();
    const storageKey = buildCommentAttachmentKey({ fileName, mimeType });

    await storage.writeBuffer(storageKey, Buffer.from(bytes), { contentType: mimeType });

    return NextResponse.json(
      {
        ok: true,
        key: storageKey,
        url: storage.publicUrl(storageKey),
        mimeType,
        sizeBytes: bytes.length,
        storage: storage.kind,
      },
      { headers: NOSNIFF },
    );
  } catch (error) {
    logError({ event: 'comment.upload', route: '/api/comments/upload', error });
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Upload failed.' },
      { status: 500, headers: NOSNIFF },
    );
  }
};
