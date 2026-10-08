import { prisma } from '@/infra/db/prisma';
import { apiError, apiOk } from '@/modules/api/respond';
import { requireApiUserId } from '@/modules/api/respond';

export const GET = async () => {
  try {
    const userId = await requireApiUserId();
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        tmdbTokenCiphertext: true,
        tmdbTokenUpdatedAt: true,
      },
    });
    if (!user) return apiError(new Error('Unauthorized'));
    return apiOk({
      user: { id: user.id, email: user.email, name: user.name },
      hasTmdbToken: Boolean(user.tmdbTokenCiphertext),
      tmdbTokenUpdatedAt: user.tmdbTokenUpdatedAt?.toISOString() ?? null,
    });
  } catch (error) {
    return apiError(error);
  }
};
