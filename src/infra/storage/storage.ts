// Local storage implementation for comment attachments.
//
// Storage choice: local dev directory (`COMMENT_STORAGE_DIR`, default
// `.data/comment-uploads`) for local development; S3/R2 via presigned PUT for
// production (when `COMMENT_STORAGE_BUCKET` + credentials are configured).

import { promises as fs } from 'node:fs';
import path from 'node:path';

export const COMMENT_STORAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
export const COMMENT_MAX_ATTACHMENT_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
export const COMMENT_MAX_ATTACHMENTS_PER_COMMENT = 4;

export type StorageProvider = {
  dir: string;
  publicUrl: (key: string) => string;
  generatePresignedUploadUrl: (params: {
    fileName: string;
    contentType: string;
    contentLength: number;
  }) => Promise<{ url: string; key: string }>;
  writeBuffer: (key: string, buffer: Buffer) => Promise<void>;
  readBuffer: (key: string) => Promise<Buffer>;
};

export const localStorage: StorageProvider = {
  dir: process.env.COMMENT_STORAGE_DIR ?? '.data/comment-uploads',
  // Stored outside `public/` in production, so reads are streamed by the
  // comment files route rather than exposed as static assets.
  publicUrl: (key: string) =>
    `/api/comments/files/${key.split('/').map(encodeURIComponent).join('/')}`,
  generatePresignedUploadUrl: async (params: {
    fileName: string;
    contentType: string;
    contentLength: number;
  }) => {
    const key = `comment-attachments/${Date.now()}-${params.fileName}`;
    return { url: `/api/comments/uploads/${key.replace(/[^a-zA-Z0-9-]/g, '-')}`, key };
  },
  writeBuffer: async (key, buffer) => {
    const fullPath = path.join(localStorage.dir, key);
    const absoluteDir = path.dirname(fullPath);
    await fs.mkdir(absoluteDir, { recursive: true });
    await fs.writeFile(fullPath, buffer);
  },
  readBuffer: async (key) => {
    const fullPath = path.join(localStorage.dir, key);
    return await fs.readFile(fullPath);
  },
};

export const storage = localStorage;
export const getCommentStorage = () => storage;
