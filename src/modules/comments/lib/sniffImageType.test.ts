import { describe, expect, it } from 'vitest';
import { sniffImageType } from '@/modules/comments/lib/sniffImageType';

const bytes = (...values: number[]) => new Uint8Array(values);

describe('sniffImageType', () => {
  it('recognises a JPEG from its SOI marker', () => {
    expect(sniffImageType(bytes(0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10))).toBe('image/jpeg');
  });

  it('recognises a PNG from its full signature', () => {
    expect(
      sniffImageType(bytes(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x01)),
    ).toBe('image/png');
  });

  it('recognises a WebP from RIFF + WEBP', () => {
    const riff = [0x52, 0x49, 0x46, 0x46];
    const size = [0x24, 0x00, 0x00, 0x00];
    const webp = [0x57, 0x45, 0x42, 0x50];
    expect(sniffImageType(bytes(...riff, ...size, ...webp))).toBe('image/webp');
  });

  it('rejects HTML masquerading as an image', () => {
    const html = new TextEncoder().encode('<!DOCTYPE html><script>alert(1)</script>');
    expect(sniffImageType(html)).toBeNull();
  });

  it('rejects SVG', () => {
    const svg = new TextEncoder().encode('<svg xmlns="http://www.w3.org/2000/svg"></svg>');
    expect(sniffImageType(svg)).toBeNull();
  });

  it('rejects a RIFF file that is not WebP (e.g. a WAV)', () => {
    const wav = [0x52, 0x49, 0x46, 0x46, 0x24, 0x00, 0x00, 0x00, 0x57, 0x41, 0x56, 0x45];
    expect(sniffImageType(bytes(...wav))).toBeNull();
  });

  it('rejects truncated signatures', () => {
    expect(sniffImageType(bytes(0x89, 0x50))).toBeNull();
    expect(sniffImageType(bytes())).toBeNull();
  });
});
