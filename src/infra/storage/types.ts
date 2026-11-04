export type StorageKind = 'local' | 's3';

export type StorageWriteOptions = {
  contentType?: string;
};

export type StorageProvider = {
  kind: StorageKind;
  /** Public URL the browser can render directly. */
  publicUrl: (key: string) => string;
  writeBuffer: (key: string, buffer: Buffer, options?: StorageWriteOptions) => Promise<void>;
  readBuffer: (key: string) => Promise<Buffer>;
  exists: (key: string) => Promise<boolean>;
};
