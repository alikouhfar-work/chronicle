import { NextResponse } from 'next/server';
import { apiError, apiOk, requireApiUserId } from '@/modules/api/respond';
import { getTrackedMovie } from '@/modules/movie/queries/getTrackedMovie';
import { getFreshTrackedShow } from '@/modules/show/queries/getFreshTrackedShow';
import { addMedia } from '@/modules/library/services/addMedia';
import { updateMovieTrackingStatus } from '@/modules/movie/actions/updateMovieTrackingStatus';
import { updateShowTrackingStatus } from '@/modules/show/actions/updateShowTrackingStatus';
import { deleteMovieFromLibrary } from '@/modules/movie/actions/deleteMovieFromLibrary';
import { deleteShowFromLibrary } from '@/modules/show/actions/deleteShowFromLibrary';
import {
  MovieTrackingStatus,
  ShowTrackingStatus,
} from '../../../../../../../generated/prisma/enums';

type Ctx = { params: Promise<{ type: string; tmdbId: string }> };

const isMediaType = (value: string): value is 'movie' | 'tv' =>
  value === 'movie' || value === 'tv';

const readBody = async (req: Request): Promise<{ status?: string }> => {
  try {
    return (await req.json()) as { status?: string };
  } catch {
    return {};
  }
};

export const GET = async (_req: Request, ctx: Ctx) => {
  try {
    await requireApiUserId();
    const { type, tmdbId } = await ctx.params;
    if (!isMediaType(type)) {
      return NextResponse.json(
        { ok: false as const, error: 'Unknown media type', code: 'VALIDATION_ERROR' },
        { status: 400 },
      );
    }
    const media = type === 'movie' ? await getTrackedMovie(tmdbId) : await getFreshTrackedShow(tmdbId);
    if (!media) {
      return NextResponse.json(
        { ok: false as const, error: 'Not in your library', code: 'NOT_FOUND' },
        { status: 404 },
      );
    }
    return apiOk({ media });
  } catch (error) {
    return apiError(error);
  }
};

export const POST = async (req: Request, ctx: Ctx) => {
  try {
    await requireApiUserId();
    const { type, tmdbId } = await ctx.params;
    if (!isMediaType(type)) {
      return NextResponse.json(
        { ok: false as const, error: 'Unknown media type', code: 'VALIDATION_ERROR' },
        { status: 400 },
      );
    }
    const { status } = await readBody(req);
    const id = Number(tmdbId);
    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json(
        { ok: false as const, error: 'Invalid tmdb id', code: 'VALIDATION_ERROR' },
        { status: 400 },
      );
    }
    if (status !== undefined) {
      const allowed =
        type === 'movie' ? Object.values(MovieTrackingStatus) : Object.values(ShowTrackingStatus);
      if (!allowed.includes(status as never)) {
        return NextResponse.json(
          { ok: false as const, error: `Invalid tracking status: ${status}`, code: 'VALIDATION_ERROR' },
          { status: 400 },
        );
      }
    }
    const media = await addMedia({
      tmdbId: id,
      mediaType: type,
      trackingStatus: status as never,
    });
    return apiOk({ media }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
};

export const PATCH = async (req: Request, ctx: Ctx) => {
  try {
    await requireApiUserId();
    const { type, tmdbId } = await ctx.params;
    if (!isMediaType(type)) {
      return NextResponse.json(
        { ok: false as const, error: 'Unknown media type', code: 'VALIDATION_ERROR' },
        { status: 400 },
      );
    }
    const { status } = await readBody(req);
    const tracked =
      type === 'movie' ? await getTrackedMovie(tmdbId) : await getFreshTrackedShow(tmdbId);
    if (!tracked) {
      return NextResponse.json(
        { ok: false as const, error: 'Not in your library', code: 'NOT_FOUND' },
        { status: 404 },
      );
    }
    if (type === 'movie') {
      await updateMovieTrackingStatus(tracked.id, status as MovieTrackingStatus);
    } else {
      await updateShowTrackingStatus(tracked.id, status as ShowTrackingStatus);
    }
    return apiOk({});
  } catch (error) {
    return apiError(error);
  }
};

export const DELETE = async (_req: Request, ctx: Ctx) => {
  try {
    await requireApiUserId();
    const { type, tmdbId } = await ctx.params;
    if (!isMediaType(type)) {
      return NextResponse.json(
        { ok: false as const, error: 'Unknown media type', code: 'VALIDATION_ERROR' },
        { status: 400 },
      );
    }
    const tracked =
      type === 'movie' ? await getTrackedMovie(tmdbId) : await getFreshTrackedShow(tmdbId);
    if (!tracked) {
      return NextResponse.json(
        { ok: false as const, error: 'Not in your library', code: 'NOT_FOUND' },
        { status: 404 },
      );
    }
    const result =
      type === 'movie'
        ? await deleteMovieFromLibrary(tracked.id)
        : await deleteShowFromLibrary(tracked.id);
    if (!result.success) {
      return NextResponse.json(
        { ok: false as const, error: result.error ?? 'Delete failed', code: 'NOT_FOUND' },
        { status: 404 },
      );
    }
    return apiOk({});
  } catch (error) {
    return apiError(error);
  }
};
