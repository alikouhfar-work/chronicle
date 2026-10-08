import { NextResponse } from 'next/server';
import { apiError, apiOk, requireApiUserId } from '@/modules/api/respond';
import { setSeasonWatched } from '@/modules/episode-season/actions/setSeasonWatched';

export const POST = async (req: Request) => {
  try {
    await requireApiUserId();
    let body: { showId?: string; seasonId?: string; watched?: boolean } = {};
    try {
      body = (await req.json()) as typeof body;
    } catch {
      body = {};
    }
    if (!body.showId || !body.seasonId || typeof body.watched !== 'boolean') {
      return NextResponse.json(
        { ok: false as const, error: 'showId, seasonId and watched are required', code: 'VALIDATION_ERROR' },
        { status: 400 },
      );
    }
    await setSeasonWatched(body.showId, body.seasonId, body.watched);
    return apiOk({});
  } catch (error) {
    return apiError(error);
  }
};
