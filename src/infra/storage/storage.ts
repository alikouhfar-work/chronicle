// Comment-attachment storage.
//
// One provider interface, two backends: S3-compatible object storage whenever
// `S3_BUCKET` is configured (production), local disk otherwise (development).
// Callers must always resolve the provider through `getCommentStorage()` so a
// deployment can switch backends without code changes.

import 'server-only';

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { readObjectStorageConfig } from '@/infra/storage/config';
import { createS3Storage } from '@/infra/storage/s3Storage';
import type { StorageProvider } from '@/infra/storage/types';

export type { StorageKind, StorageProvider, StorageWriteOptions } from '@/infra/storage/types';

export const COMMENT_STORAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
export const COMMENT_MAX_ATTACHMENT_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
export const COMMENT_MAX_ATTACHMENTS_PER_COMMENT = 4;
export const COMMENT_ATTACHMENT_PREFIX = 'comment-attachments';

const localRoot = (): string => process.env.COMMENT_STORAGE_DIR ?? '.data/comment-uploads';

/** Local-disk fallback for development; images are streamed by the files route. */
export const localStorage: StorageProvider = {
  kind: 'local',
  publicUrl: (key) => `/api/comments/files/${key.split('/').map(encodeURIComponent).join('/')}`,
  writeBuffer: async (key, buffer) => {
    const fullPath = path.join(localRoot(), key);
    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    await fs.writeFile(fullPath, buffer);
  },
  readBuffer: async (key) => fs.readFile(path.join(localRoot(), key)),
  exists: async (key) => {
    try {
      await fs.access(path.join(localRoot(), key));
      return true;
    } catch {
      return false;
    }
  },
};

/**
 * S3-compatible storage when configured, local disk otherwise.
 * The underlying S3 client is memoized per bucket/endpoint.
 */
export const getCommentStorage = (env: NodeJS.ProcessEnv = process.env): StorageProvider => {
  const config = readObjectStorageConfig(env);
  return config ? createS3Storage(config) : localStorage;
};

/** A key is only ever a `comment-attachments/...` object name. */
export const isCommentAttachmentKey = (key: unknown): key is string =>
  typeof key === 'string' &&
  key.startsWith(`${COMMENT_ATTACHMENT_PREFIX}/`) &&
  key.length > COMMENT_ATTACHMENT_PREFIX.length + 1 &&
  !key.includes('..') &&
  !key.includes('\0');

/**
 * Rejects client-supplied URLs this deployment did not mint, so an attachment
 * can never point at an arbitrary external host.
 */
export const isCommentAttachmentUrl = (url: unknown): url is string =>
  typeof url === 'string' &&
  url.startsWith(getCommentStorage().publicUrl(`${COMMENT_ATTACHMENT_PREFIX}/`));
