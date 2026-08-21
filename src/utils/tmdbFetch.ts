const baseUrl = process.env.BASE_URL;
const accessToken = process.env.ACCESS_TOKEN;

if (!accessToken) {
  throw new Error('ACCESS_TOKEN is not defined');
}

export async function tmdbFetch<T>(
  path: string,
  options: RequestInit & {
    next?: NextFetchRequestConfig;
  } = {},
): Promise<T> {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${process.env.ACCESS_TOKEN!}`,
      Accept: 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`TMDB request failed (${response.status})`);
  }

  return response.json() as Promise<T>;
}
