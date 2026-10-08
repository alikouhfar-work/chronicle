import { NextResponse } from 'next/server';
import { register } from '@/infra/auth/actions';
import { apiError, apiOk } from '@/modules/api/respond';
import { verifyCredentials } from '@/modules/api/auth';

const readBody = async (req: Request): Promise<{ email?: string; password?: string }> => {
  try {
    return (await req.json()) as { email?: string; password?: string };
  } catch {
    return {};
  }
};

export const POST = async (req: Request) => {
  try {
    const { email = '', password = '' } = await readBody(req);
    const result = await register(email, password);
    if (!result.ok) {
      const conflict = result.error?.includes('already exists') ?? false;
      return NextResponse.json(
        {
          ok: false as const,
          error: result.error ?? 'Registration failed',
          code: conflict ? 'EMAIL_TAKEN' : 'VALIDATION_ERROR',
        },
        { status: conflict ? 409 : 400 },
      );
    }
    const session = await verifyCredentials(email, password);
    if (!session) {
      return NextResponse.json(
        { ok: false as const, error: 'Registration succeeded but sign-in failed', code: 'APP_ERROR' },
        { status: 500 },
      );
    }
    return apiOk(session, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
};
