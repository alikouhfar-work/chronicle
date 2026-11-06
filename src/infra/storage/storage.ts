import { env } from '@/infra/env';
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
/** Total bytes one account may keep in attachments. */
export const COMMENT_USER_QUOTA_BYTES = 250 * 1024 * 1024;
/** Uploads allowed per account per rolling day. */
export const COMMENT_DAILY_UPLOAD_LIMIT = 40;

const localRoot = (): string => env.commentStorageDir;

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
  list: async (prefix) => {
    const walk = async (directory: string): Promise<string[]> => {
      let entries;
      try {
        entries = await fs.readdir(directory, { withFileTypes: true });
      } catch {
        return [];
      }

      const files: string[] = [];
      for (const entry of entries) {
        const full = path.join(directory, entry.name);
        if (entry.isDirectory()) {
          files.push(...(await walk(full)));
        } else if (entry.isFile()) {
          files.push(path.relative(localRoot(), full).split(path.sep).join('/'));
        }
      }
      return files;
    };

    const keys = (await walk(path.join(localRoot(), prefix))).filter((key) => key.startsWith(prefix));

    return Promise.all(
      keys.map(async (key) => {
        const stats = await fs.stat(path.join(localRoot(), key));
        return { key, lastModified: stats.mtime, size: stats.size };
      }),
    );
  },
  remove: async (key) => {
    try {
      await fs.unlink(path.join(localRoot(), key));
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
    }
  },
};

/**
 * S3-compatible storage when configured, local disk otherwise.
 * The underlying S3 client is memoized per bucket/endpoint.
 */
export const getCommentStorage = (env: NodeJS.ProcessEnv = process.env): StorageProvider => {
  const config = readObjectStorageConfig(env);

  if (config) return createS3Storage(config);

  // The disk fallback is a development convenience: on a server the filesystem
  // is ephemeral and each instance sees only its own uploads.
  if (env.NODE_ENV === 'production') {
    throw new Error(
      'S3_BUCKET is not configured. Comment attachments need S3-compatible object ' +
        'storage in production (set S3_BUCKET, S3_REGION and credentials).',
    );
  }

  return localStorage;
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
