import type { CommentMimeType } from '@/modules/comments/types/commentMimeType';

const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
const JPEG_SIGNATURE = [0xff, 0xd8, 0xff];
const WEBP_RIFF = [0x52, 0x49, 0x46, 0x46]; // "RIFF"
const WEBP_TAG = [0x57, 0x45, 0x42, 0x50]; // "WEBP"

const startsWith = (bytes: Uint8Array, signature: number[], offset = 0): boolean =>
  bytes.length >= offset + signature.length &&
  signature.every((byte, index) => bytes[offset + index] === byte);

/**
 * Identifies an uploaded image by its magic bytes. The browser-reported MIME
 * type is attacker-controlled, so storage keys and stored content types are
 * derived from this instead.
 */
export const sniffImageType = (bytes: Uint8Array): CommentMimeType | null => {
  if (startsWith(bytes, JPEG_SIGNATURE)) return 'image/jpeg';
  if (startsWith(bytes, PNG_SIGNATURE)) return 'image/png';
  if (startsWith(bytes, WEBP_RIFF) && startsWith(bytes, WEBP_TAG, 8)) return 'image/webp';
  return null;
};
