/**
 * The only place that reads server environment variables (WP-29).
 *
 * No `import 'server-only'` here on purpose: `tsx` scripts (e2e/seed.ts) and
 * next.config's helpers import this graph directly, and the marker throws outside
 * the Next bundler. Nothing leaks either way — Next only inlines NEXT_PUBLIC_*
 * values, so a server-only name is `undefined` in a client bundle. Client files
 * importing this module are rejected by the architecture test instead.
 *
 * Deliberately getters rather than frozen constants: a few suites and scripts
 * assign `process.env` after the module graph is imported, and a snapshot taken
 * at import time would silently ignore them. Fail-fast is applied where a missing
 * value is never survivable (`DATABASE_URL`, `AUTH_SECRET`); everything a
 * deployment can legitimately omit (demo token, cron secret, Google creds) stays
 * optional so the app still boots and the feature degrades.
 */

const missing = (name: string): never => {
  throw new Error(`[env] ${name} is not set`);
};

export const env = {
  /* --- runtime mode ------------------------------------------------------ */
  get isProduction(): boolean {
    return process.env.NODE_ENV === 'production';
  },
  get isBuildPhase(): boolean {
    return process.env.NEXT_PHASE === 'phase-production-build';
  },
  get vercelUrl(): string | undefined {
    return process.env.VERCEL_URL;
  },

  /* --- database ---------------------------------------------------------- */
  get prismaTarget(): string | undefined {
    return process.env.PRISMA_TARGET;
  },
  get isDemoDatabase(): boolean {
    return process.env.PRISMA_TARGET === 'demo';
  },
  get databaseUrl(): string {
    return process.env.DATABASE_URL ?? missing('DATABASE_URL');
  },
  get demoDatabaseUrl(): string | undefined {
    return process.env.DEMO_DATABASE_URL;
  },

  /* --- auth -------------------------------------------------------------- */
  get authSecret(): string {
    return process.env.AUTH_SECRET ?? missing('AUTH_SECRET');
  },
  get googleId(): string | undefined {
    return process.env.AUTH_GOOGLE_ID;
  },
  get googleSecret(): string | undefined {
    return process.env.AUTH_GOOGLE_SECRET;
  },
  get hasGoogle(): boolean {
    return Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET);
  },
  get guestLoginEnabled(): boolean {
    return process.env.GUEST_LOGIN_ENABLED === 'true';
  },
  get demoUserEmail(): string {
    return process.env.DEMO_USER_EMAIL ?? 'demo@chronicle.local';
  },

  /* --- TMDB (single shared token) ---------------------------------------- */
  get tmdbBaseUrl(): string | undefined {
    return process.env.TMDB_BASE_URL;
  },
  get tmdbAccessToken(): string | undefined {
    return process.env.TMDB_ACCESS_TOKEN ?? process.env.DEMO_TMDB_TOKEN;
  },
  get hasTmdbToken(): boolean {
    return Boolean(process.env.TMDB_ACCESS_TOKEN ?? process.env.DEMO_TMDB_TOKEN);
  },

  /* --- storage ----------------------------------------------------------- */
  get commentStorageDir(): string {
    return process.env.COMMENT_STORAGE_DIR ?? '.data/comment-uploads';
  },
  get s3PublicBaseUrl(): string {
    return process.env.S3_PUBLIC_BASE_URL ?? '';
  },

  /* --- operator endpoints ------------------------------------------------ */
  get cronSecret(): string | undefined {
    return process.env.CRON_SECRET;
  },
};
