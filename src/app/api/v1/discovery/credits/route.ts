import { NextResponse } from 'next/server';
import { apiError, apiOk, requireApiTokenOr428, requireApiUserId } from '@/modules/api/respond';
import { getMovieCredits } from '@/modules/movie/queries/getMovieCredits';
import { getShowCredits } from '@/modules/show/queries/getShowCredits';

export const GET = async (req: Request) => {
  try {
    const userId = await requireApiUserId();
    const missing = await requireApiTokenOr428(userId);
    if (missing) return missing;
    const params = new URL(req.url).searchParams;
    const mediaType = params.get('mediaType');
    const id = params.get('id') ?? '';
    if ((mediaType !== 'movie' && mediaType !== 'tv') || !id) {
      return NextResponse.json(
        { ok: false as const, error: 'mediaType (movie|tv) and id are required', code: 'VALIDATION_ERROR' },
        { status: 400 },
      );
    }
    const credits = mediaType === 'movie' ? await getMovieCredits(id) : await getShowCredits(id);
    return apiOk({ credits });
  } catch (error) {
    return apiError(error);
  }
};
