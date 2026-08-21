type TmdbImageType = 'poster' | 'backdrop' | 'avatar';

type TmdbImageSize =
  'w45' | 'w92' | 'w154' | 'w185' | 'w300' | 'w342' | 'w500' | 'w780' | 'w1280' | 'original';

const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

export const getTmdbImageUrl = (
  path: string | null,
  type: TmdbImageType = 'poster',
  size?: TmdbImageSize,
) => {
  const defaultSize = type === 'poster' ? 'w500' : type === 'backdrop' ? 'w1280' : 'w185';

  const selectedSize = size ?? defaultSize;

  return `${IMAGE_BASE_URL}/${selectedSize}${path}`;
};
