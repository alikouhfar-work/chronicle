import { NextResponse } from 'next/server';
import { apiError, apiOk, requireApiUserId } from '@/modules/api/respond';
import { addMovieLog } from '@/modules/movie/actions/addMovieLog';

export const POST = async (req: Request) => {
  try {
    await requireApiUserId();
    let body: { movieId?: string; rating?: number; notes?: string } = {};
    try {
      body = (await req.json()) as typeof body;
    } catch {
      body = {};
    }
    if (!body.movieId) {
      return NextResponse.json(
        { ok: false as const, error: 'movieId is required', code: 'VALIDATION_ERROR' },
        { status: 400 },
      );
    }
    const form = new FormData();
    form.set('movieId', body.movieId);
    form.set('rating', String(body.rating ?? 0));
    form.set('notes', body.notes ?? '');
    const result = await addMovieLog({ success: false }, form);
    if (!result.success) {
      return NextResponse.json(
        { ok: false as const, error: result.error ?? 'Could not save review', code: 'VALIDATION_ERROR' },
        { status: 400 },
      );
    }
    return apiOk({});
  } catch (error) {
    return apiError(error);
  }
};
