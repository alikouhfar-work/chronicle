import { publicEnv } from '@/shared/lib/publicEnv';
import { headers } from 'next/headers';
import { env } from '@/infra/env';

const LOCAL_FALLBACK = 'http://localhost:3000';

const normalize = (value: string): string => value.replace(/\/$/, '');

/**
 * Canonical origin used for share links and Open Graph metadata.
 *
 * Prefers `NEXT_PUBLIC_APP_URL` (tunnel/deployment URL) so previews generated
 * in development resolve to a URL social crawlers can actually reach. Falls
 * back to the incoming request host, then Vercel's deployment URL, and only
 * then to localhost. Keeping this in one place makes metadata consistent
 * across environments.
 */
export const getAppBaseUrl = async (): Promise<string> => {
  const configured = publicEnv.configuredAppUrl;
  if (configured) return configured;

  try {
    const requestHeaders = await headers();
    const host = requestHeaders.get('x-forwarded-host') ?? requestHeaders.get('host');
    if (host) {
      const proto =
        requestHeaders.get('x-forwarded-proto') ??
        (host.includes('localhost') || host.startsWith('127.') ? 'http' : 'https');
      return normalize(`${proto}://${host}`);
    }
  } catch {
    // `headers()` is unavailable outside a request scope (e.g. unit tests).
  }

  if (env.vercelUrl) return normalize(`https://${env.vercelUrl}`);

  return LOCAL_FALLBACK;
};
