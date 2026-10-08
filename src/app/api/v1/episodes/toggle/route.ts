import { NextResponse } from 'next/server';
import { apiError, apiOk, requireApiUserId } from '@/modules/api/respond';
import { toggleEpisodeWatched } from '@/modules/episode-season/actions/toggleEpisodeWatched';

export const POST = async (req: Request) => {
  try {
    await requireApiUserId();
    let body: { showId?: string; episodeId?: string } = {};
    try {
      body = (await req.json()) as typeof body;
    } catch {
      body = {};
    }
    if (!body.showId || !body.episodeId) {
      return NextResponse.json(
        { ok: false as const, error: 'showId and episodeId are required', code: 'VALIDATION_ERROR' },
        { status: 400 },
      );
    }
    await toggleEpisodeWatched(body.showId, body.episodeId);
    return apiOk({});
  } catch (error) {
    return apiError(error);
  }
};
