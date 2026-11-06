'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/infra/db/prisma';
import { requireUserId } from '@/infra/tmdb/forUser';
import { isValidUsername, normalizeUsername } from '@/shared/lib/username';
import type { UsernameState } from '@/modules/user/types';

const isUniqueViolation = (error: unknown): boolean =>
  typeof error === 'object' && error !== null && (error as { code?: string }).code === 'P2002';

export const updateUsername = async (
  _prevState: UsernameState,
  formData: FormData,
): Promise<UsernameState> => {
  const raw = formData.get('username');
  if (typeof raw !== 'string') {
    return { success: false, error: 'Enter a handle.' };
  }

  const username = normalizeUsername(raw);
  if (!isValidUsername(username)) {
    return {
      success: false,
      error: 'Handles are 3–32 characters: lowercase letters, numbers, and underscores.',
    };
  }

  let userId: string;
  try {
    userId = await requireUserId();
  } catch {
    return { success: false, error: 'You need to sign in to change your handle.' };
  }

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { username },
      select: { id: true },
    });
  } catch (error) {
    if (isUniqueViolation(error)) {
      return { success: false, error: 'That handle is already taken. Try another.' };
    }
    return { success: false, error: 'Could not save your handle. Please try again.' };
  }

  revalidatePath('/settings/profile');
  return { success: true };
};
