export type TmdbImageType = 'poster' | 'backdrop' | 'avatar';

export type TmdbImageSize =
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

export type TmdbFetchOptions = RequestInit & {
  next?: NextFetchRequestConfig;
  timeoutMs?: number;
};
