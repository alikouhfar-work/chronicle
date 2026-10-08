import { NextResponse } from 'next/server';
import { apiError, apiOk } from '@/modules/api/respond';
import { signInGuest } from '@/modules/api/auth';

export const POST = async () => {
  try {
    const session = await signInGuest();
    if (!session) {
      return NextResponse.json(
        { ok: false as const, error: 'Guest login is disabled', code: 'GUEST_DISABLED' },
        { status: 403 },
      );
    }
    return apiOk(session);
  } catch (error) {
    return apiError(error);
  }
};
