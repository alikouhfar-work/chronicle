/**
 * Reads a request body while enforcing a hard byte cap.
 *
 * `await request.arrayBuffer()` materialises the whole body first, so a 500 MB
 * POST would be fully buffered before the size check rejected it. This reads
 * incrementally and cancels the stream as soon as the cap is crossed, returning
 * `null` so the caller can answer 413.
 */
export const readCappedBody = async (
  request: Request,
  maxBytes: number,
): Promise<Uint8Array | null> => {
  if (!request.body) return new Uint8Array();

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;

  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!value) continue;

      total += value.byteLength;
      if (total > maxBytes) {
        await reader.cancel();
        return null;
      }

      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  const body = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return body;
};
