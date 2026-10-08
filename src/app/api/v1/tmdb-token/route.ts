import { NextResponse } from 'next/server';
import {
  deleteTmdbToken,
  getTmdbTokenStatus,
  saveTmdbToken,
} from '@/infra/tmdb/actions';
import { apiError, apiOk, requireApiUserId } from '@/modules/api/respond';

export const GET = async () => {
  try {
    await requireApiUserId();
    const status = await getTmdbTokenStatus();
    return apiOk({
      configured: status.configured,
      updatedAt: status.updatedAt?.toISOString() ?? null,
    });
  } catch (error) {
    return apiError(error);
  }
};

export const PUT = async (req: Request) => {
  try {
    await requireApiUserId();
    let body: { token?: string } = {};
    try {
      body = (await req.json()) as typeof body;
    } catch {
      body = {};
    }
    const result = await saveTmdbToken(body.token ?? '');
    if (!result.ok) {
      return NextResponse.json(
        { ok: false as const, error: result.error ?? 'Could not save token', code: 'VALIDATION_ERROR' },
        { status: 400 },
      );
    }
    return apiOk({ masked: result.masked ?? null });
  } catch (error) {
    return apiError(error);
  }
};

export const DELETE = async () => {
  try {
    await requireApiUserId();
    await deleteTmdbToken();
    return apiOk({});
  } catch (error) {
    return apiError(error);
  }
};
