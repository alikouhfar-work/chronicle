import 'server-only';

export type ObjectStorageConfig = {
  bucket: string;
  region: string;
  endpoint?: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  /** CDN/custom-domain base used for rendered URLs (no trailing slash). */
  publicBaseUrl?: string;
  forcePathStyle: boolean;
};

const trimTrailingSlash = (value: string): string => value.replace(/\/+$/, '');

const optional = (value: string | undefined): string | undefined =>
  value && value.trim().length > 0 ? value.trim() : undefined;

/**
 * Reads S3-compatible object storage settings (AWS S3, Cloudflare R2, MinIO,
 * Backblaze B2). Returns null when no bucket is configured, which keeps local
 * disk as the development fallback.
 */
export const readObjectStorageConfig = (
  env: NodeJS.ProcessEnv = process.env,
): ObjectStorageConfig | null => {
  const bucket = optional(env.S3_BUCKET);
  if (!bucket) return null;

  return {
    bucket,
    region: optional(env.S3_REGION) ?? 'us-east-1',
    endpoint: optional(env.S3_ENDPOINT),
    accessKeyId: optional(env.S3_ACCESS_KEY_ID),
    secretAccessKey: optional(env.S3_SECRET_ACCESS_KEY),
    publicBaseUrl: optional(env.S3_PUBLIC_BASE_URL)
      ? trimTrailingSlash(optional(env.S3_PUBLIC_BASE_URL) as string)
      : undefined,
    forcePathStyle: env.S3_FORCE_PATH_STYLE === 'true',
  };
};

export const isObjectStorageConfigured = (env: NodeJS.ProcessEnv = process.env): boolean =>
  readObjectStorageConfig(env) !== null;
