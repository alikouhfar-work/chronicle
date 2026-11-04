import 'server-only';

import {
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { readObjectStorageConfig } from '@/infra/storage/config';
import type { ObjectStorageConfig } from '@/infra/storage/config';
import type { StorageProvider } from '@/infra/storage/types';

let cachedClient: { config: ObjectStorageConfig; client: S3Client } | null = null;

const createClient = (config: ObjectStorageConfig): S3Client => {
  if (cachedClient?.config.bucket === config.bucket && cachedClient.config.endpoint === config.endpoint) {
    return cachedClient.client;
  }

  const client = new S3Client({
    region: config.region,
    ...(config.endpoint ? { endpoint: config.endpoint } : {}),
    ...(config.accessKeyId && config.secretAccessKey
      ? {
          credentials: {
            accessKeyId: config.accessKeyId,
            secretAccessKey: config.secretAccessKey,
          },
        }
      : {}),
    forcePathStyle: config.forcePathStyle,
  });

  cachedClient = { config, client };
  return client;
};

const buildPublicUrl = (config: ObjectStorageConfig, key: string): string => {
  if (config.publicBaseUrl) return `${config.publicBaseUrl}/${key}`;

  if (config.endpoint) {
    const base = config.endpoint.replace(/\/+$/, '');
    return config.forcePathStyle
      ? `${base}/${config.bucket}/${key}`
      : `${base.replace('://', `://${config.bucket}.`)}/${key}`;
  }

  return `https://${config.bucket}.s3.${config.region}.amazonaws.com/${key}`;
};

/**
 * S3-compatible object storage (AWS S3, R2, MinIO, B2) used for comment
 * attachments in any deployment where `S3_BUCKET` is set.
 */
export const createS3Storage = (config: ObjectStorageConfig): StorageProvider => {
  const client = createClient(config);

  return {
    kind: 's3',
    publicUrl: (key) => buildPublicUrl(config, key),
    writeBuffer: async (key, buffer, options) => {
      await client.send(
        new PutObjectCommand({
          Bucket: config.bucket,
          Key: key,
          Body: buffer,
          ContentType: options?.contentType,
          CacheControl: 'public, max-age=31536000, immutable',
        }),
      );
    },
    readBuffer: async (key) => {
      const response = await client.send(
        new GetObjectCommand({ Bucket: config.bucket, Key: key }),
      );

      if (!response.Body) {
        throw new Error(`Object not found: ${key}`);
      }

      return Buffer.from(await response.Body.transformToByteArray());
    },
    exists: async (key) => {
      try {
        await client.send(new HeadObjectCommand({ Bucket: config.bucket, Key: key }));
        return true;
      } catch {
        return false;
      }
    },
  };
};

export const getS3Storage = (): StorageProvider => {
  const config = readObjectStorageConfig();
  if (!config) throw new Error('Object storage is not configured.');
  return createS3Storage(config);
};
