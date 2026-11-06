import { publicEnv } from '@/shared/lib/publicEnv';
import { getGradientForTitle } from '@/shared/lib/getGradientForTitle';
import type { TmdbImageSize, TmdbImageType } from '@/infra/tmdb/types';

// Base URL comes from `publicEnv`, which owns the NEXT_PUBLIC_* fallback chain
// (this module is imported by Client Components — see shared/lib/publicEnv).
const resolveImageBaseUrl = (): string => publicEnv.tmdbImageBaseUrl;

export const getTmdbImageUrl = (
  path: string | null | undefined,
  type: TmdbImageType = 'poster',
  size?: TmdbImageSize,
): string | null => {
  if (!path) return null;
  const defaultSize = type === 'poster' ? 'w500' : type === 'backdrop' ? 'w1280' : 'w185';
  const selectedSize = size ?? defaultSize;
  try {
    return `${resolveImageBaseUrl()}/${selectedSize}${path}`;
  } catch {
    return null;
  }
};

export const getPosterPlaceholderColor = (title: string): string => {
  const safeTitle = typeof title === 'string' && title ? title : 'untitled';
  return getGradientForTitle(safeTitle);
};
