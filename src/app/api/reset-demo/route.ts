import { NextResponse } from 'next/server';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

// child_process is not available in the Edge runtime.
export const runtime = 'nodejs';

// Prevent Next.js from trying to statically render this route at build time.
export const dynamic = 'force-dynamic';

// Allow up to 60s (Hobby plan maximum) for reset + seed to finish.
export const maxDuration = 60;

export async function GET(request: Request) {
  // ---------------------------------------------------------------------------
  // 1. Authenticate the request
  // ---------------------------------------------------------------------------
  const expected = `Bearer ${process.env.CRON_SECRET}`;
  const received = request.headers.get('authorization');

  if (!process.env.CRON_SECRET || received !== expected) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  // ---------------------------------------------------------------------------
  // 2. Resolve the demo database connection string
  // ---------------------------------------------------------------------------
  const demoUrl = process.env.DEMO_DATABASE_URL;

  if (!demoUrl) {
    return NextResponse.json(
      {
        ok: false,
        error:
          'DEMO_DATABASE_URL is not set for this environment. ' +
          'Scope it to Preview (and Production if the cron runs there).',
      },
      { status: 500 },
    );
  }

  // Build the child-process env explicitly. We set both PRISMA_TARGET (for
  // prisma.config.ts) and DATABASE_URL (as a fallback for any code path that
  // reads DATABASE_URL directly).
  const childEnv = {
    ...process.env,
    PRISMA_TARGET: 'demo',
    DATABASE_URL: demoUrl,
    DEMO_DATABASE_URL: demoUrl,
  };

  // ---------------------------------------------------------------------------
  // 3. Reset and seed
  // ---------------------------------------------------------------------------
  try {
    const reset = await execAsync('npx prisma migrate reset --force', {
      env: childEnv,
      timeout: 50_000,
    });
    console.log('[reset-demo] migrate reset:\n', reset.stdout);

    const seed = await execAsync('npx prisma db seed', {
      env: childEnv,
      timeout: 50_000,
    });
    console.log('[reset-demo] seed:\n', seed.stdout);

    return NextResponse.json({
      ok: true,
      message: 'Demo database reset and seeded successfully.',
    });
  } catch (error) {
    const err = error as {
      stdout?: string;
      stderr?: string;
      message?: string;
    };
    console.error('[reset-demo] failed:', err);

    return NextResponse.json(
      {
        ok: false,
        error: 'Reset failed',
        message: err.message,
        stdout: err.stdout,
        stderr: err.stderr,
      },
      { status: 500 },
    );
  }
}
