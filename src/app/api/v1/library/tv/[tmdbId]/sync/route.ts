import { syncShow } from '@/modules/show/actions/syncShow';
import { apiError, apiOk, requireApiUserId } from '@/modules/api/respond';

type Ctx = { params: Promise<{ tmdbId: string }> };

export const POST = async (_req: Request, ctx: Ctx) => {
  try {
    await requireApiUserId();
    const { tmdbId } = await ctx.params;
    await syncShow(tmdbId);
    return apiOk({});
  } catch (error) {
    return apiError(error);
  }
};
