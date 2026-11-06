import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * Architecture guardrails (Phase 2.3).
 *
 * These tests lock the layout rules so future edits can't quietly undo them:
 *   1. `types/` and `*.types.ts` files are type-only — no runtime statements.
 *   2. Database reads live in `services/`; external API reads in `queries/`.
 *   3. `"use client"` stays out of pages/layouts (Next only allows it in
 *      error boundaries, which must be client components).
 *   4. Client Components never import the Prisma client directly.
 */

const SRC_ROOT = join(process.cwd(), 'src');

const walk = (dir: string): string[] =>
  readdirSync(dir).flatMap((entry) => {
    const fullPath = join(dir, entry);
    if (entry === 'node_modules' || entry === '.next') return [];
    return statSync(fullPath).isDirectory() ? walk(fullPath) : [fullPath];
  });

const sourceFiles = walk(SRC_ROOT).filter(
  (file) => file.endsWith('.ts') || file.endsWith('.tsx'),
);

const toRepoPath = (file: string): string => relative(process.cwd(), file).split(sep).join('/');

const stripComments = (source: string): string =>
  source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');

const isTypeDefinitionFile = (file: string): boolean => {
  const repoPath = toRepoPath(file);
  return (
    repoPath.includes('/types/') ||
    repoPath.endsWith('/types.ts') ||
    repoPath.endsWith('.types.ts')
  );
};

const RUNTIME_STATEMENT =
  /^(?:export\s+)?(?:const|let|var|function|async\s+function|class|enum)\s/m;

describe('types files are type-only', () => {
  it('scans the source tree (guards against an empty match set)', () => {
    expect(sourceFiles.length).toBeGreaterThan(200);
    expect(sourceFiles.filter(isTypeDefinitionFile).length).toBeGreaterThan(100);
  });

  it('contains no runtime declarations', () => {
    const offenders = sourceFiles
      .filter(isTypeDefinitionFile)
      .filter((file) => RUNTIME_STATEMENT.test(stripComments(readFileSync(file, 'utf8'))))
      .map(toRepoPath);

    expect(offenders).toEqual([]);
  });

  it('detects a runtime declaration when one is present', () => {
    expect(RUNTIME_STATEMENT.test('export const COMMENT_MIN_LENGTH = 1;')).toBe(true);
    expect(RUNTIME_STATEMENT.test('export type CommentMediaType = "movie";')).toBe(false);
  });
});

describe('services own the database, queries own external APIs', () => {
  it('keeps Prisma out of queries/', () => {
    const offenders = sourceFiles
      .filter((file) => toRepoPath(file).includes('/queries/'))
      .filter((file) => readFileSync(file, 'utf8').includes('@/infra/db/prisma'))
      .map(toRepoPath);

    expect(offenders).toEqual([]);
  });

  it('keeps TMDB transport out of services/', () => {
    const offenders = sourceFiles
      .filter((file) => toRepoPath(file).includes('/services/'))
      .filter((file) => {
        const source = readFileSync(file, 'utf8');
        return source.includes('@/infra/tmdb/client') || /\btmdbFetch\b/.test(source);
      })
      .map(toRepoPath);

    expect(offenders).toEqual([]);
  });
});

describe('server-first rendering', () => {
  it('does not mark pages or layouts as Client Components', () => {
    const offenders = sourceFiles
      .filter((file) => /(page|layout)\.tsx$/.test(file))
      .filter((file) => readFileSync(file, 'utf8').trimStart().startsWith("'use client'"))
      .map(toRepoPath);

    expect(offenders).toEqual([]);
  });

  it('never imports Prisma from a Client Component', () => {
    const offenders = sourceFiles
      .filter((file) => file.endsWith('.tsx') || file.endsWith('.ts'))
      .filter((file) => {
        const source = readFileSync(file, 'utf8');
        return (
          source.trimStart().startsWith("'use client'") && source.includes('@/infra/db/prisma')
        );
      })
      .map(toRepoPath);

    expect(offenders).toEqual([]);
  });
});

/**
 * Layering (Phase 5, WP-25).
 *
 * The dependency direction is `app → modules → shared → infra`. The two rules
 * below are absolute; the third is a ratchet over the feature-to-feature edges
 * that exist today, so new ones cannot appear without editing this list on
 * purpose.
 */
const MODULE_IMPORT = /from\s+['"]@\/modules\/([a-z-]+)/g;

const featureImportsOf = (file: string): string[] =>
  [...readFileSync(file, 'utf8').matchAll(MODULE_IMPORT)].flatMap((m) => (m[1] ? [m[1]] : []));

describe('layer direction', () => {
  it('keeps features out of shared/', () => {
    const offenders = sourceFiles
      .filter((file) => toRepoPath(file).startsWith('src/shared/'))
      .filter((file) => featureImportsOf(file).length > 0)
      .map(toRepoPath);

    expect(offenders).toEqual([]);
  });

  it('keeps infra/ below shared/ and modules/', () => {
    const offenders = sourceFiles
      .filter((file) => toRepoPath(file).startsWith('src/infra/'))
      .filter((file) => {
        const source = readFileSync(file, 'utf8');
        return featureImportsOf(file).length > 0 || source.includes("from '@/shared/ui");
      })
      .map(toRepoPath);

    expect(offenders).toEqual([]);
  });

  it('only allows the feature→feature edges that already exist', () => {
    // Snapshot of 2026-11-05 (WP-25). Shrinking is fine; adding is not — move the
    // code down a layer instead. Genuine two-way pairs to unwind: library↔discovery,
    // comments↔notes, show↔episode-season.
    const ALLOWED: Record<string, string[]> = {
      comments: ['notes', 'notifications', 'user'],
      dashboard: ['episode-season', 'library', 'movie', 'show'],
      discovery: ['library', 'movie', 'show'],
      'episode-season': ['media', 'rewatch', 'show'],
      library: ['comments', 'discovery', 'episode-season', 'movie', 'notes', 'rewatch', 'show'],
      media: ['discovery'],
      movie: ['discovery', 'media'],
      notes: ['comments', 'media'],
      notifications: ['comments', 'user'],
      rewatch: ['media'],
      show: ['discovery', 'episode-season', 'media'],
    };

    const offenders: string[] = [];
    for (const file of sourceFiles) {
      const repoPath = toRepoPath(file);
      if (!repoPath.startsWith('src/modules/') || /\.test\.|__fixtures__/.test(repoPath)) continue;

      const from = repoPath.split('/')[2];
      for (const to of new Set(featureImportsOf(file))) {
        if (to === from) continue;
        const allowed = from ? (ALLOWED[from] ?? []) : [];
        if (!allowed.includes(to)) offenders.push(`${from} -> ${to} (${repoPath})`);
      }
    }

    expect(offenders).toEqual([]);
  });
});

describe('environment access', () => {
  it('is confined to the env modules', () => {
    // WP-29: one door for configuration. `securityHeaders` is exempt because
    // next.config.ts imports it by relative path and cannot resolve `@/`.
    const ALLOWED = new Set([
      'src/infra/env.ts',
      'src/shared/lib/publicEnv.ts',
      'src/infra/http/securityHeaders.ts',
    ]);

    const offenders = sourceFiles
      .map(toRepoPath)
      .filter((repoPath) => repoPath.startsWith('src/'))
      .filter((repoPath) => !/\.test\.|__fixtures__/.test(repoPath))
      .filter((repoPath) => !ALLOWED.has(repoPath))
      .filter((repoPath) =>
        /process\.env\.[A-Z]/.test(readFileSync(join(process.cwd(), repoPath), 'utf8')),
      );

    expect(offenders).toEqual([]);
  });
});

describe('server env stays server-side', () => {
  it('is never imported by a Client Component', () => {
    const offenders = sourceFiles
      .filter((file) => readFileSync(file, 'utf8').trimStart().startsWith("'use client'"))
      .filter((file) => readFileSync(file, 'utf8').includes("from '@/infra/env'"))
      .map(toRepoPath);

    expect(offenders).toEqual([]);
  });
});

describe('module public surface', () => {
  it('keeps barrels re-exporting only their own module', () => {
    const offenders = sourceFiles
      .filter((file) => /^src\/modules\/[a-z-]+\/index\.ts$/.test(toRepoPath(file)))
      .flatMap((file) => {
        const own = toRepoPath(file).split('/')[2];
        const specifiers = [
          ...readFileSync(file, 'utf8').matchAll(/from\s+['"]([^'"]+)['"]/g),
        ].flatMap((m) => (m[1] ? [m[1]] : []));
        return specifiers
          .filter((spec) => spec.includes('@/') && !spec.includes(`@/modules/${own}`))
          .map((spec) => `${own}: ${spec}`);
      });

    expect(offenders).toEqual([]);
  });

  it('does not import a barrel by file path', () => {
    const offenders = sourceFiles
      .filter((file) => /from\s+['"]@\/modules\/[a-z-]+\/index['"]/.test(readFileSync(file, 'utf8')))
      .map(toRepoPath);

    expect(offenders).toEqual([]);
  });
});
