import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';

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
  class DeleteObjectCommand {
    constructor(input: unknown) {
      sdk.put({ deleted: input });
    }
  }
  class ListObjectsV2Command {
    constructor(public input: unknown) {
      sdk.put({ listed: input });
    }
  }
  class S3Client {
    constructor(public config: unknown) {}
    send = sdk.send;
  }
  return {
    S3Client,
    PutObjectCommand,
    GetObjectCommand,
    HeadObjectCommand,
    DeleteObjectCommand,
    ListObjectsV2Command,
  };
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

describe('local provider maintenance operations', () => {
  const prepare = async () => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'chronicle-attachments-'));
    process.env.COMMENT_STORAGE_DIR = dir;
    return dir;
  };

  afterEach(async () => {
    const dir = process.env.COMMENT_STORAGE_DIR;
    delete process.env.COMMENT_STORAGE_DIR;
    if (dir?.includes('chronicle-attachments-')) {
      await fs.rm(dir, { recursive: true, force: true });
    }
  });

  it('lists objects under the attachment prefix with mtimes', async () => {
    const dir = await prepare();
    await fs.mkdir(path.join(dir, 'comment-attachments'), { recursive: true });
    await fs.writeFile(path.join(dir, 'comment-attachments', 'a.png'), 'x');
    await fs.writeFile(path.join(dir, 'other.txt'), 'y');

    const objects = await localStorage.list('comment-attachments/');

    expect(objects.map((object) => object.key)).toEqual(['comment-attachments/a.png']);
    expect(objects[0]?.size).toBe(1);
    expect(objects[0]?.lastModified).toBeInstanceOf(Date);
  });

  it('removes an object and tolerates a missing one', async () => {
    const dir = await prepare();
    await fs.mkdir(path.join(dir, 'comment-attachments'), { recursive: true });
    await fs.writeFile(path.join(dir, 'comment-attachments', 'a.png'), 'x');

    await localStorage.remove('comment-attachments/a.png');
    await expect(fs.access(path.join(dir, 'comment-attachments', 'a.png'))).rejects.toThrow();

    await expect(localStorage.remove('comment-attachments/a.png')).resolves.toBeUndefined();
  });

  it('refuses to build a storage provider without a bucket in production', () => {
    expect(() => getCommentStorage(env({ NODE_ENV: 'production' }))).toThrow(/S3_BUCKET/);
  });
});

describe('S3 maintenance operations', () => {
  it('deletes an object through DeleteObject', async () => {
    const storage = getCommentStorage(env({ S3_BUCKET: 'chronicle' }));

    await storage.remove('comment-attachments/a.png');

    expect(sdk.put).toHaveBeenCalledWith({
      deleted: { Bucket: 'chronicle', Key: 'comment-attachments/a.png' },
    });
  });

  it('pages through ListObjectsV2 results', async () => {
    const storage = getCommentStorage(env({ S3_BUCKET: 'chronicle' }));

    sdk.send
      .mockResolvedValueOnce({
        Contents: [{ Key: 'comment-attachments/a.png', Size: 10, LastModified: new Date() }],
        IsTruncated: true,
        NextContinuationToken: 'page-2',
      })
      .mockResolvedValueOnce({
        Contents: [{ Key: 'comment-attachments/b.png', Size: 20, LastModified: new Date() }],
        IsTruncated: false,
      });

    const objects = await storage.list('comment-attachments/');

    expect(objects.map((object) => object.key)).toEqual([
      'comment-attachments/a.png',
      'comment-attachments/b.png',
    ]);
    expect(sdk.put).toHaveBeenLastCalledWith({
      listed: expect.objectContaining({ ContinuationToken: 'page-2' }),
    });
  });
});
