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
