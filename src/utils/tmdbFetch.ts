const baseUrl = process.env.TMDB_BASE_URL;
const accessToken = process.env.TMDB_ACCESS_TOKEN;

export const tmdbFetch = async <T>(
  path: string,
  options: RequestInit & {
    next?: NextFetchRequestConfig;
  } = {},
): Promise<T> => {
  if (!accessToken) {
    throw new Error('TMDB_ACCESS_TOKEN is not defined');
  }

  const response = await fetch(`${baseUrl}/${path}`, {
    ...options,
    next: {
      revalidate: 86400,
      ...options.next,
    },
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`TMDB request failed (${response.status})`);
  }

  return response.json() as Promise<T>;
};