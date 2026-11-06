import { NextResponse } from 'next/server';
import { auth } from '@/infra/auth/auth';

const isLogin = (pathname: string): boolean =>
  pathname === '/login' ||
  pathname.startsWith('/login/') ||
  pathname === '/signup' ||
  pathname.startsWith('/signup/');

// Link-preview crawlers (Telegram, WhatsApp, Discord, …) never carry a
// session. Public detail pages are readable by anyone so the shared review
// feeds can be viewed (and linked to) without an account; only search stays
// crawler-only because it is not a share target.
const PREVIEW_CRAWLER_PATTERN =
  /(telegrambot|whatsapp|facebookexternalhit|twitterbot|discordbot|slackbot|linkedinbot|pinterest|embedly|redditbot|skypeuripreview|vkshare|mastodon|applebot)/i;

const isPreviewCrawler = (req: Parameters<Parameters<typeof auth>[0]>[0]): boolean => {
  if (req.method !== 'GET' && req.method !== 'HEAD') return false;
  const userAgent = req.headers.get('user-agent') ?? '';
  return PREVIEW_CRAWLER_PATTERN.test(userAgent);
};

const isPublicMediaPath = (pathname: string): boolean =>
  pathname.startsWith('/library/movie/') || pathname.startsWith('/library/tv/');

const isPublicPreviewPath = (pathname: string): boolean =>
  pathname === '/search' || pathname.startsWith('/search/');

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

  // --- No session: public media detail pages are read-only (review browsing);
  // everything else needs login.
  // (Catalogue reads use the single server token — no per-user token gate.)
  if (!userId) {
    const isRead = req.method === 'GET' || req.method === 'HEAD';
    if (
      isRead &&
      (isPublicMediaPath(pathname) || (isPublicPreviewPath(pathname) && isPreviewCrawler(req)))
    ) {
      return NextResponse.next();
    }
    return loginRedirect(req, `${pathname}${search}`);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|icons|manifest.webmanifest|.*\\..*).*)'],
};
