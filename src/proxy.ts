import { NextResponse } from 'next/server';
import { auth } from '@/infra/auth/auth';
import { prisma } from '@/infra/db/prisma';

const ONBOARDING_PATH = '/onboarding/tmdb';
const SETTINGS_TMDB_PATH = '/settings/tmdb';

const isLogin = (pathname: string): boolean =>
  pathname === '/login' ||
  pathname.startsWith('/login/') ||
  pathname === '/signup' ||
  pathname.startsWith('/signup/');

const isOnboarding = (pathname: string): boolean => pathname.startsWith('/onboarding');

const isSettingsTmdb = (pathname: string): boolean => pathname.startsWith(SETTINGS_TMDB_PATH);

/** DB check: does the user have a TMDB token stored? */
const hasTmdbToken = async (userId: string): Promise<boolean> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { tmdbTokenCiphertext: true, tmdbTokenIv: true },
    });
    return Boolean(user?.tmdbTokenCiphertext && user?.tmdbTokenIv);
  } catch {
    return false;
  }
};

const loginRedirect = (req: Parameters<Parameters<typeof auth>[0]>[0], pathname: string) => {
  const loginUrl = new URL('/login', req.url);
  loginUrl.searchParams.set('callbackUrl', pathname);
  return NextResponse.redirect(loginUrl);
};

export default auth(async (req) => {
  const { pathname, search } = req.nextUrl;
  const userId = req.auth?.user?.id;

  // --- /login: signed-in users go to their destination, others see the form.
  if (isLogin(pathname)) {
    if (!userId) return NextResponse.next();
    const callbackUrl = req.nextUrl.searchParams.get('callbackUrl') ?? '/';
    return NextResponse.redirect(new URL(callbackUrl, req.url));
  }

  // --- No session: everything else needs login (except onboarding bounce below).
  if (!userId) return loginRedirect(req, `${pathname}${search}`);

  // --- /onboarding: token holders don't need it.
  if (isOnboarding(pathname)) {
    if (await hasTmdbToken(userId)) return NextResponse.redirect(new URL('/', req.url));
    return NextResponse.next();
  }

  // --- /settings/tmdb must stay reachable without a token (rotation / first save).
  if (isSettingsTmdb(pathname)) return NextResponse.next();

  // --- All other pages require a TMDB token.
  if (!(await hasTmdbToken(userId))) {
    return NextResponse.redirect(new URL(ONBOARDING_PATH, req.url));
  }
  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|icons|manifest.webmanifest|.*\\..*).*)',
  ],
};
