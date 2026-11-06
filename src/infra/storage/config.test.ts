import { describe, expect, it } from 'vitest';
import { isObjectStorageConfigured, readObjectStorageConfig } from '@/infra/storage/config';

const env = (values: Record<string, string>): NodeJS.ProcessEnv => values as NodeJS.ProcessEnv;

describe('readObjectStorageConfig', () => {
  it('returns null when no bucket is configured (local disk fallback)', () => {
    expect(readObjectStorageConfig(env({}))).toBeNull();
    expect(readObjectStorageConfig(env({ S3_BUCKET: '   ' }))).toBeNull();
    expect(isObjectStorageConfigured(env({}))).toBe(false);
  });

  it('defaults the region and disables path-style addressing', () => {
    expect(readObjectStorageConfig(env({ S3_BUCKET: 'chronicle' }))).toEqual({
      bucket: 'chronicle',
      region: 'us-east-1',
      endpoint: undefined,
      accessKeyId: undefined,
      secretAccessKey: undefined,
      publicBaseUrl: undefined,
      forcePathStyle: false,
    });
  });

  it('reads an R2/MinIO style endpoint, credentials, and CDN base', () => {
    const config = readObjectStorageConfig(
      env({
        S3_BUCKET: 'chronicle',
        S3_REGION: 'auto',
        S3_ENDPOINT: 'https://account.r2.cloudflarestorage.com',
        S3_ACCESS_KEY_ID: 'key',
        S3_SECRET_ACCESS_KEY: 'secret',
        S3_PUBLIC_BASE_URL: 'https://cdn.example.com/',
        S3_FORCE_PATH_STYLE: 'true',
      }),
    );

    expect(config).toMatchObject({
      bucket: 'chronicle',
      region: 'auto',
      endpoint: 'https://account.r2.cloudflarestorage.com',
      accessKeyId: 'key',
      secretAccessKey: 'secret',
      publicBaseUrl: 'https://cdn.example.com',
      forcePathStyle: true,
    });
    expect(isObjectStorageConfigured(env({ S3_BUCKET: 'chronicle' }))).toBe(true);
  });
});
