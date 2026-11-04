import { beforeEach, describe, expect, it, vi } from 'vitest';
import { buildCommentAttachmentKey, extensionForMime } from '@/modules/comments/lib/attachmentKey';

describe('buildCommentAttachmentKey', () => {
  it('builds a prefixed, timestamped, collision-free key', () => {
    expect(
      buildCommentAttachmentKey({
        fileName: 'My Poster (final).PNG',
        mimeType: 'image/png',
        now: 1700000000000,
        uuid: '11111111-2222-3333-4444-555555555555',
      }),
    ).toBe(
      'comment-attachments/1700000000000-11111111-2222-3333-4444-555555555555-my-poster-final.png',
    );
  });

  it('falls back to "image" when the name has no usable characters', () => {
    expect(
      buildCommentAttachmentKey({
        fileName: '🙂.jpg',
        mimeType: 'image/jpeg',
        now: 1,
        uuid: 'u',
      }),
    ).toBe('comment-attachments/1-u-image.jpg');
  });

  it('caps the base name at 48 characters', () => {
    const key = buildCommentAttachmentKey({
      fileName: `${'a'.repeat(80)}.webp`,
      mimeType: 'image/webp',
      now: 1,
      uuid: 'u',
    });

    expect(key).toBe(`comment-attachments/1-u-${'a'.repeat(48)}.webp`);
  });

  it('maps every supported mime type to its extension', () => {
    expect(extensionForMime('image/jpeg')).toBe('jpg');
    expect(extensionForMime('image/png')).toBe('png');
    expect(extensionForMime('image/webp')).toBe('webp');
  });
});

describe('attachment keys are unique per upload', () => {
  beforeEach(() => {
    vi.useRealTimers();
  });

  it('generates distinct keys for the same file name', () => {
    const first = buildCommentAttachmentKey({ fileName: 'shot.png', mimeType: 'image/png' });
    const second = buildCommentAttachmentKey({ fileName: 'shot.png', mimeType: 'image/png' });
    expect(first).not.toBe(second);
  });
});
