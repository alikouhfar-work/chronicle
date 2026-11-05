export type StorageKind = 'local' | 's3';

export type StorageWriteOptions = {
  contentType?: string;
};

export type StoredObject = {
  key: string;
  /** Null when the backend cannot report it (rare); the sweep then skips it. */
  lastModified: Date | null;
  size: number;
};

export type StorageProvider = {
  kind: StorageKind;
  /** Public URL the browser can render directly. */
  publicUrl: (key: string) => string;
  writeBuffer: (key: string, buffer: Buffer, options?: StorageWriteOptions) => Promise<void>;
  readBuffer: (key: string) => Promise<Buffer>;
  exists: (key: string) => Promise<boolean>;
  /** Objects under a prefix, used by the orphan sweep. */
  list: (prefix: string) => Promise<StoredObject[]>;
  /** Deletes one object; a missing object is not an error. */
  remove: (key: string) => Promise<void>;
};
