const baseUrl = process.env.BASE_URL;
const accessToken = process.env.ACCESS_TOKEN;

export async function tmdbFetch<T>(
  path: string,
  options: RequestInit & {
    next?: NextFetchRequestConfig;
  } = {},
): Promise<T> {
  if (!accessToken) {
    throw new Error('ACCESS_TOKEN is not defined');
  }

  const response = await fetch(`${baseUrl}/${path}`, {
    ...options,
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
}
