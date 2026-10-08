import { NextResponse } from 'next/server';
import { apiError, apiOk, requireApiUserId } from '@/modules/api/respond';
import { setShowWatched } from '@/modules/show/actions/setShowWatched';

export const POST = async (req: Request) => {
  try {
    await requireApiUserId();
    let body: { showId?: string; watched?: boolean } = {};
    try {
      body = (await req.json()) as typeof body;
    } catch {
      body = {};
    }
    if (!body.showId || typeof body.watched !== 'boolean') {
      return NextResponse.json(
        { ok: false as const, error: 'showId and watched are required', code: 'VALIDATION_ERROR' },
        { status: 400 },
      );
    }
    await setShowWatched(body.showId, body.watched);
    return apiOk({});
  } catch (error) {
    return apiError(error);
  }
};
