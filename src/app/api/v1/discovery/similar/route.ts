import { NextResponse } from 'next/server';
import { apiError, apiOk, requireApiTokenOr428, requireApiUserId } from '@/modules/api/respond';
import { getSimilarMovies } from '@/modules/movie/queries/getSimilarMovies';
import { getSimilarShows } from '@/modules/show/queries/getSimilarShows';

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
    const similar = mediaType === 'movie' ? await getSimilarMovies(id) : await getSimilarShows(id);
    return apiOk({ similar });
  } catch (error) {
    return apiError(error);
  }
};
