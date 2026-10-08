import { NextResponse } from 'next/server';
import { apiError, apiOk } from '@/modules/api/respond';
import { verifyCredentials } from '@/modules/api/auth';

export const POST = async (req: Request) => {
  try {
    let body: { email?: string; password?: string } = {};
    try {
      body = (await req.json()) as typeof body;
    } catch {
      body = {};
    }
    const session = await verifyCredentials(body.email ?? '', body.password ?? '');
    if (!session) {
      return NextResponse.json(
        { ok: false as const, error: 'Incorrect email or password', code: 'INVALID_CREDENTIALS' },
        { status: 401 },
      );
    }
    return apiOk(session);
  } catch (error) {
    return apiError(error);
  }
};
