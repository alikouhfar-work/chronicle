import { describe, expect, it, vi } from 'vitest';

const sdk = vi.hoisted(() => ({
  send: vi.fn().mockResolvedValue({}),
  put: vi.fn(),
  head: vi.fn(),
}));

vi.mock('@aws-sdk/client-s3', () => {
  class PutObjectCommand {
    constructor(input: unknown) {
      sdk.put(input);
    }
  }
  class GetObjectCommand {
    constructor(public input: unknown) {}
  }
  class HeadObjectCommand {
    constructor(input: unknown) {
      sdk.head(input);
    }
  }
  class S3Client {
    constructor(public config: unknown) {}
    send = sdk.send;
  }
  return { S3Client, PutObjectCommand, GetObjectCommand, HeadObjectCommand };
});

const {
  getCommentStorage,
  isCommentAttachmentKey,
  isCommentAttachmentUrl,
  localStorage,
} = await import('@/infra/storage/storage');

const env = (values: Record<string, string>): NodeJS.ProcessEnv => values as NodeJS.ProcessEnv;

describe('getCommentStorage', () => {
  it('falls back to local disk without a bucket', () => {
    expect(getCommentStorage(env({})).kind).toBe('local');
    expect(getCommentStorage(env({}))).toBe(localStorage);
  });

  it('selects S3 when a bucket is configured', () => {
    expect(getCommentStorage(env({ S3_BUCKET: 'chronicle' })).kind).toBe('s3');
  });
});

describe('S3 storage provider', () => {
  it('builds AWS virtual-host URLs by default', () => {
    const storage = getCommentStorage(
      env({ S3_BUCKET: 'chronicle', S3_REGION: 'eu-west-1' }),
    );
    expect(storage.publicUrl('comment-attachments/a.png')).toBe(
      'https://chronicle.s3.eu-west-1.amazonaws.com/comment-attachments/a.png',
    );
  });

  it('honours a CDN base URL and path-style endpoints', () => {
    const cdn = getCommentStorage(
      env({ S3_BUCKET: 'chronicle', S3_PUBLIC_BASE_URL: 'https://cdn.example.com' }),
    );
    expect(cdn.publicUrl('comment-attachments/a.png')).toBe(
      'https://cdn.example.com/comment-attachments/a.png',
    );

    const minio = getCommentStorage(
      env({
        S3_BUCKET: 'chronicle',
        S3_ENDPOINT: 'http://localhost:9000',
        S3_FORCE_PATH_STYLE: 'true',
      }),
    );
    expect(minio.publicUrl('comment-attachments/a.png')).toBe(
      'http://localhost:9000/chronicle/comment-attachments/a.png',
    );
  });

  it('puts objects with the right bucket, key, content type, and caching', async () => {
    const storage = getCommentStorage(env({ S3_BUCKET: 'chronicle' }));
    await storage.writeBuffer('comment-attachments/a.png', Buffer.from('bytes'), {
      contentType: 'image/png',
    });

    expect(sdk.put).toHaveBeenCalledWith({
      Bucket: 'chronicle',
      Key: 'comment-attachments/a.png',
      Body: Buffer.from('bytes'),
      ContentType: 'image/png',
      CacheControl: 'public, max-age=31536000, immutable',
    });
  });

  it('reports existence through HeadObject', async () => {
    const storage = getCommentStorage(env({ S3_BUCKET: 'chronicle' }));

    sdk.send.mockResolvedValueOnce({});
    await expect(storage.exists('comment-attachments/a.png')).resolves.toBe(true);

    sdk.send.mockRejectedValueOnce(new Error('NotFound'));
    await expect(storage.exists('comment-attachments/missing.png')).resolves.toBe(false);
  });
});

describe('attachment key and URL validation', () => {
  it('only accepts comment-attachment object keys', () => {
    expect(isCommentAttachmentKey('comment-attachments/a.png')).toBe(true);
    expect(isCommentAttachmentKey('comment-attachments/')).toBe(false);
    expect(isCommentAttachmentKey('other/a.png')).toBe(false);
    expect(isCommentAttachmentKey('comment-attachments/../secret.png')).toBe(false);
    expect(isCommentAttachmentKey(undefined)).toBe(false);
  });

  it('rejects external URLs the deployment did not mint', () => {
    expect(isCommentAttachmentUrl('/api/comments/files/comment-attachments/a.png')).toBe(true);
    expect(isCommentAttachmentUrl('https://evil.example.com/a.png')).toBe(false);
    expect(isCommentAttachmentUrl('javascript:alert(1)')).toBe(false);
  });
});
