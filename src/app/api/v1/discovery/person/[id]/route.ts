import { NextResponse } from 'next/server';
import { apiError, apiOk, requireApiTokenOr428, requireApiUserId } from '@/modules/api/respond';
import { getPerson } from '@/modules/discovery/person/queries/getPerson';
import { getCombinedCredits } from '@/modules/discovery/person/queries/getCombinedCredits';

type Ctx = { params: Promise<{ id: string }> };

export const GET = async (_req: Request, ctx: Ctx) => {
  try {
    const userId = await requireApiUserId();
    const missing = await requireApiTokenOr428(userId);
    if (missing) return missing;
    const { id } = await ctx.params;
    const [person, combinedCredits] = await Promise.all([getPerson(id), getCombinedCredits(id)]);
    if (!person) {
      return NextResponse.json(
        { ok: false as const, error: 'Person not found', code: 'NOT_FOUND' },
        { status: 404 },
      );
    }
    return apiOk({ person, combinedCredits });
  } catch (error) {
    return apiError(error);
  }
};
