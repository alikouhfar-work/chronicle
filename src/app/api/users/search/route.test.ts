import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  findMany: vi.fn(),
  requireUserId: vi.fn(),
}));

vi.mock('@/infra/db/prisma', () => ({
  prisma: { user: { findMany: mocks.findMany } },
}));
vi.mock('@/infra/tmdb/forUser', () => ({ requireUserId: mocks.requireUserId }));

import { GET } from '@/app/api/users/search/route';

const request = (q: string) => new Request(`http://localhost/api/users/search?q=${encodeURIComponent(q)}`);

describe('GET /api/users/search', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireUserId.mockResolvedValue(`search-user-${crypto.randomUUID()}`);
    mocks.findMany.mockResolvedValue([]);
  });

  it('requires authentication', async () => {
    mocks.requireUserId.mockRejectedValue(new Error('Unauthorized'));

    const response = await GET(request('ali'));

    expect(response.status).toBe(401);
    expect(mocks.findMany).not.toHaveBeenCalled();
  });

  it('requires two query characters and searches case-insensitive username prefixes', async () => {
    mocks.findMany.mockResolvedValue([
      { id: 'user-1', username: 'alice', name: 'Alice', image: null },
    ]);

    const shortResponse = await GET(request('a'));
    const response = await GET(request('Al'));
    const payload = await response.json();

    expect(shortResponse.status).toBe(400);
    expect(response.status).toBe(200);
    expect(payload.users).toEqual([
      { id: 'user-1', username: 'alice', name: 'Alice', image: null },
    ]);
    expect(mocks.findMany).toHaveBeenCalledWith({
      where: { username: { startsWith: 'Al', mode: 'insensitive' } },
      select: { id: true, username: true, name: true, image: true },
      orderBy: { username: 'asc' },
      take: 8,
    });
  });

  it('limits results to eight and rate-limits each authenticated user', async () => {
    const userId = `rate-limited-${crypto.randomUUID()}`;
    mocks.requireUserId.mockResolvedValue(userId);
    mocks.findMany.mockResolvedValue(Array.from({ length: 8 }, (_, id) => ({ id })));

    let response!: Response;
    for (let attempt = 0; attempt < 31; attempt += 1) {
      response = await GET(request('ab'));
    }

    expect(response.status).toBe(429);
    expect(mocks.findMany).toHaveBeenCalledTimes(30);
    expect(mocks.findMany.mock.calls[0]![0]!.take).toBe(8);
  });
});
