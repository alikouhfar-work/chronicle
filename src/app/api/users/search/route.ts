import { NextResponse } from 'next/server';
import { prisma } from '@/infra/db/prisma';
import { requireUserId } from '@/infra/tmdb/forUser';

const MIN_QUERY_LENGTH = 2;
const MAX_USERNAME_LENGTH = 32;
const MAX_RESULTS = 8;
const RATE_LIMIT = 30;
const RATE_WINDOW_MS = 60_000;

const searchWindows = new Map<string, { startedAt: number; count: number }>();

const consumeSearchLimit = (userId: string, now = Date.now()): number | null => {
  for (const [key, window] of searchWindows) {
    if (now - window.startedAt >= RATE_WINDOW_MS) searchWindows.delete(key);
  }

  const current = searchWindows.get(userId);
  if (!current || now - current.startedAt >= RATE_WINDOW_MS) {
    searchWindows.set(userId, { startedAt: now, count: 1 });
    return null;
  }

  if (current.count >= RATE_LIMIT) {
    return Math.max(1, Math.ceil((current.startedAt + RATE_WINDOW_MS - now) / 1000));
  }

  current.count += 1;
  return null;
};

export async function GET(request: Request) {
  let userId: string;
  try {
    userId = await requireUserId();
  } catch {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  }

  const q = new URL(request.url).searchParams.get('q')?.trim() ?? '';
  if (
    q.length < MIN_QUERY_LENGTH ||
    q.length > MAX_USERNAME_LENGTH ||
    !/^[a-z0-9_]+$/i.test(q)
  ) {
    return NextResponse.json({ error: 'Query must contain 2-32 username characters.' }, { status: 400 });
  }

  const retryAfter = consumeSearchLimit(userId);
  if (retryAfter !== null) {
    return NextResponse.json(
      { error: 'Too many user searches. Try again shortly.' },
      { status: 429, headers: { 'Retry-After': String(retryAfter) } },
    );
  }

  try {
    const users = await prisma.user.findMany({
      where: { username: { startsWith: q, mode: 'insensitive' } },
      select: { id: true, username: true, name: true, image: true },
      orderBy: { username: 'asc' },
      take: MAX_RESULTS,
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error('user mention search error:', error);
    return NextResponse.json({ error: 'Could not search users.' }, { status: 500 });
  }
}
