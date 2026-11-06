import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NotFoundError } from '@/shared/lib/errors';

const mocks = vi.hoisted(() => ({
  userId: vi.fn(),
  recordRewatch: vi.fn(),
  removeRewatchLog: vi.fn(),
  revalidate: vi.fn(),
}));

vi.mock('@/modules/rewatch/services/rewatchService', () => ({
  recordRewatch: mocks.recordRewatch,
  removeRewatchLog: mocks.removeRewatchLog,
}));

vi.mock('@/infra/tmdb/forUser', () => ({
  requireUserId: mocks.userId,
  MissingTmdbTokenError: class extends Error {},
}));

vi.mock('@/shared/lib/revalidate', () => ({ revalidateMediaDetail: mocks.revalidate }));

// The route only needs a JSON response object; the real NextResponse drags the
// Next server runtime into the test for no benefit.
vi.mock('next/server', () => ({
  NextResponse: {
    json: (body: unknown, init?: { status?: number }) => ({
      status: init?.status ?? 200,
      body,
    }),
  },
}));

import { addRewatch } from '@/modules/rewatch/actions/addRewatch';
import { removeRewatch } from '@/modules/rewatch/actions/removeRewatch';
import { POST } from '@/app/api/media/[type]/[id]/rewatch/route';
import { DELETE } from '@/app/api/media/rewatch/[logId]/route';

const MEDIA_ID = 'movie-row-1';
const AT = '2026-11-01T10:00:00.000Z';
const KEY = 'request-key-1';

const recordedResult = {
  mediaType: 'movie' as const,
  mediaId: MEDIA_ID,
  tmdbId: 550,
  rewatchCount: 3,
  logId: 'log-1',
  rewatchedAt: new Date(AT),
};

const postRoute = async (body: unknown, idempotencyKey?: string) => {
  const request = new Request('http://localhost/api/media/movie/movie-row-1/rewatch', {
    method: 'POST',
    headers: idempotencyKey ? { 'idempotency-key': idempotencyKey } : undefined,
    body: JSON.stringify(body),
  });

  return POST(request, { params: Promise.resolve({ type: 'movie', id: MEDIA_ID }) });
};

describe('rewatch write contract', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.userId.mockResolvedValue('user-1');
    mocks.recordRewatch.mockResolvedValue(recordedResult);
    mocks.removeRewatchLog.mockResolvedValue({
      mediaType: 'movie',
      mediaId: MEDIA_ID,
      tmdbId: 550,
      rewatchCount: 2,
      removedLogs: 1,
      undoToken: 'removal-1',
    });
  });

  it('sends identical commands to the service from the action and the route', async () => {
    const actionResult = await addRewatch('movie', MEDIA_ID, AT, KEY);
    const routeResponse = await postRoute({ rewatched_at: AT }, KEY);

    expect(actionResult).toMatchObject({ success: true, rewatchCount: 3, logId: 'log-1' });
    expect(routeResponse.status).toBe(201);

    const [actionCall, routeCall] = mocks.recordRewatch.mock.calls;
    if (!actionCall || !routeCall) throw new Error('expected two recordRewatch calls');
    expect(routeCall[0]).toEqual(actionCall[0]);
    expect(actionCall[0]).toEqual({
      userId: 'user-1',
      mediaType: 'movie',
      mediaId: MEDIA_ID,
      rewatchedAt: AT,
      clientRequestId: KEY,
    });
  });

  it('reads every documented body alias the same way', async () => {
    await postRoute({ rewatchedAt: AT, client_request_id: KEY });
    await postRoute({ date: AT, clientRequestId: KEY });

    for (const call of mocks.recordRewatch.mock.calls) {
      expect(call[0]).toMatchObject({ rewatchedAt: AT, clientRequestId: KEY });
    }
  });

  it('maps one failure to the same message, code and status on both paths', async () => {
    mocks.recordRewatch.mockRejectedValue(new NotFoundError('Watch target not found'));

    const actionResult = await addRewatch('movie', MEDIA_ID, AT);
    const routeResponse = await postRoute({ rewatched_at: AT });

    expect(actionResult).toEqual({ success: false, error: 'Watch target not found' });
    expect(routeResponse.status).toBe(404);
    expect(routeResponse.body).toEqual({
      ok: false,
      error: 'Watch target not found',
      code: 'NOT_FOUND',
    });
  });

  it('answers an unauthenticated write with one 401 copy on both paths', async () => {
    mocks.userId.mockRejectedValue(new Error('Unauthorized'));

    const actionResult = await addRewatch('movie', MEDIA_ID, AT);
    const routeResponse = await postRoute({ rewatched_at: AT });

    expect(routeResponse.status).toBe(401);
    expect(routeResponse.body).toEqual({
      ok: false,
      error: 'Authentication required. Sign in again.',
      code: 'UNAUTHORIZED',
    });
    expect(actionResult).toEqual({
      success: false,
      error: 'Authentication required. Sign in again.',
    });
  });

  it('rejects invalid input with the same message before touching the service', async () => {
    const actionResult = await addRewatch('podcast' as never, MEDIA_ID, AT);
    const routeResponse = await POST(
      new Request('http://localhost/api/media/podcast/movie-row-1/rewatch', {
        method: 'POST',
        body: JSON.stringify({}),
      }),
      { params: Promise.resolve({ type: 'podcast', id: MEDIA_ID }) },
    );

    const body = routeResponse.body as unknown as { ok: boolean; error: string; code: string };

    if (actionResult.success) throw new Error('expected the action to fail');

    expect(routeResponse.status).toBe(400);
    expect(body).toMatchObject({ ok: false, code: 'VALIDATION_ERROR' });
    expect(actionResult.error).toBe(body.error);
    expect(mocks.recordRewatch).not.toHaveBeenCalled();
  });

  it('removes a log through the same id validation on both paths', async () => {
    const actionResult = await removeRewatch('log-1');
    const deleteResponse = await DELETE(
      new Request('http://localhost/api/media/rewatch/log-1', { method: 'DELETE' }),
      { params: Promise.resolve({ logId: 'log-1' }) },
    );

    expect(actionResult).toMatchObject({ success: true, rewatchCount: 2, undoToken: 'removal-1' });
    expect(deleteResponse.status).toBe(200);
    expect(mocks.removeRewatchLog.mock.calls[0]![0]).toEqual(
      mocks.removeRewatchLog.mock.calls[1]![0],
    );
    expect(mocks.removeRewatchLog.mock.calls[0]![0]).toEqual({ userId: 'user-1', logId: 'log-1' });
  });

  it('treats an empty log id as invalid on both paths', async () => {
    const actionResult = await removeRewatch('   ');
    const deleteResponse = await DELETE(
      new Request('http://localhost/api/media/rewatch/empty', { method: 'DELETE' }),
      { params: Promise.resolve({ logId: '   ' }) },
    );

    expect(actionResult.success).toBe(false);
    expect(deleteResponse.status).toBe(400);
    expect(deleteResponse.body as unknown).toMatchObject({ code: 'VALIDATION_ERROR' });
    expect(mocks.removeRewatchLog).not.toHaveBeenCalled();
  });
});
