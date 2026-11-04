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
