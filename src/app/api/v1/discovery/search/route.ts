import { NextResponse } from 'next/server';
import { apiError, apiOk, requireApiUserId } from '@/modules/api/respond';
import { searchMedia } from '@/modules/discovery/search/queries/searchMedia';

export const GET = async (req: Request) => {
  try {
    await requireApiUserId();
    const query = new URL(req.url).searchParams.get('query') ?? '';
    if (!query.trim()) {
      return NextResponse.json(
        { ok: false as const, error: 'query is required', code: 'VALIDATION_ERROR' },
        { status: 400 },
      );
    }
    const results = await searchMedia(query);
    return apiOk({ results });
  } catch (error) {
    return apiError(error);
  }
};
