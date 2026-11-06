import { describe, expect, it } from 'vitest';
import { readCappedBody } from '@/modules/comments/lib/readCappedBody';

const requestWith = (chunks: Uint8Array[], headers: Record<string, string> = {}) =>
  new Request('http://localhost/upload', {
    method: 'POST',
    headers,
    // A ReadableStream body: Request requires duplex in Node.
    body: new ReadableStream<Uint8Array>({
      start(controller) {
        for (const chunk of chunks) controller.enqueue(chunk);
        controller.close();
      },
    }),
    // @ts-expect-error Node's fetch requires duplex for streaming request bodies.
    duplex: 'half',
  });

const chunkOf = (size: number, fill = 0x61) => new Uint8Array(size).fill(fill);

describe('readCappedBody', () => {
  it('returns the body when it fits under the cap', async () => {
    const body = await readCappedBody(requestWith([chunkOf(10), chunkOf(5)]), 100);

    expect(body).not.toBeNull();
    expect(body?.length).toBe(15);
    expect(body?.[0]).toBe(0x61);
  });

  it('returns null as soon as the cap is crossed, without draining the stream', async () => {
    let pulled = 0;
    const request = new Request('http://localhost/upload', {
      method: 'POST',
      body: new ReadableStream<Uint8Array>({
        pull(controller) {
          pulled += 1;
          controller.enqueue(chunkOf(1024));
          if (pulled > 1000) controller.close();
        },
      }),
      // @ts-expect-error Node's fetch requires duplex for streaming request bodies.
      duplex: 'half',
    });

    const body = await readCappedBody(request, 4096);

    expect(body).toBeNull();
    // 4096 / 1024 = 4 chunks + the one that crosses the cap.
    expect(pulled).toBeLessThanOrEqual(6);
  });

  it('accepts a body exactly at the cap', async () => {
    const body = await readCappedBody(requestWith([chunkOf(100)]), 100);

    expect(body?.length).toBe(100);
  });

  it('handles an empty body', async () => {
    const request = new Request('http://localhost/upload', { method: 'POST' });

    const body = await readCappedBody(request, 10);

    expect(body?.length).toBe(0);
  });
});
