import { getGradientForTitle } from '@/shared/lib/getGradientForTitle';

type TmdbImageType = 'poster' | 'backdrop' | 'avatar';

type TmdbImageSize =
  | 'w45'
  | 'w92'
  | 'w154'
  | 'w185'
  | 'w300'
  | 'w342'
  | 'w500'
  | 'w780'
  | 'w1280'
  | 'original';

const resolveImageBaseUrl = (): string => {
  const baseUrl = process.env.NEXT_PUBLIC_TMDB_IMAGE_BASE_URL ?? process.env.TMDB_IMAGE_BASE_URL;
  if (!baseUrl) {
    throw new Error('[infra/tmdb] Missing TMDB image base URL env');
  }
  return baseUrl.replace(/\/$/, '');
};

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
