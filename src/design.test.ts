import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * Design-system guardrails (`docs/design-audit.md`).
 *
 * The palette and the type scale drifted because nothing stopped them: by the time
 * the audit ran there were 97 arbitrary font sizes (9/10/11/13px), five radius
 * steps, and three colours for one status. These tests make the token layer the
 * only way in for *new* code, and ratchet the legacy debt so it can only shrink.
 *
 * Rules:
 *   1. No arbitrary type sizes — `text-[11px]` is not a scale, `text-micro` is.
 *   2. No raw palette families in components — `bg-zinc-800` is a primitive, not a
 *      role; the exception is poster artwork, which may use the neutral ramp.
 *   3. No raw hex in components — tokens own the values.
 *   4. Radii come from the scale (xs / control / card / pill).
 *   5. Removing the focus ring requires a replacement: `focus:outline-none` must be
 *      paired with `focus-visible:` (or a `focus-within:` ring on the wrapper).
 */

const SRC_ROOT = join(process.cwd(), 'src');

const walk = (dir: string): string[] =>
  readdirSync(dir).flatMap((entry) => {
    const fullPath = join(dir, entry);
    if (entry === 'node_modules' || entry === '.next') return [];
    return statSync(fullPath).isDirectory() ? walk(fullPath) : [fullPath];
  });

const toRepoPath = (file: string): string => relative(process.cwd(), file).split(sep).join('/');

const componentFiles = walk(SRC_ROOT).filter(
  (file) => (file.endsWith('.tsx') || file.endsWith('.ts')) && !file.includes('.test.'),
);

/** Poster artwork may use the neutral ramp: a gradient scrim is not UI chrome. */
const POSTER_FALLBACK_ALLOWED = [
  // Poster artwork: a title-derived gradient is an image placeholder, not chrome.
  'src/shared/lib/getGradientForTitle.ts',
  'src/infra/tmdb/images.ts',
];

const read = (file: string): string => readFileSync(file, 'utf8');

describe('design tokens', () => {
  it('uses the type scale, never an arbitrary size', () => {
    const offenders = componentFiles
      .filter((file) => /\btext-\[\d+(?:\.\d+)?(?:px|rem|em)\]/.test(read(file)))
      .map(toRepoPath);

    expect(offenders).toEqual([]);
  });

  it('keeps raw palette families out of components', () => {
    const families =
      'amber|rose|red|emerald|indigo|sky|violet|blue|teal|green|purple|fuchsia|pink|yellow|orange|slate|gray|neutral|stone|zinc';
    const pattern = new RegExp(
      `\\b(?:bg|text|border|ring|from|to|via|fill|stroke|shadow|divide|outline|decoration|caret|accent|placeholder)-(?:${families})-\\d{2,3}\\b`,
    );

    const offenders = componentFiles
      .filter((file) => !POSTER_FALLBACK_ALLOWED.includes(toRepoPath(file)))
      .filter((file) => pattern.test(read(file)))
      .map(toRepoPath);

    expect(offenders).toEqual([]);
  });

  it('keeps raw hex values out of components', () => {
    const offenders = componentFiles
      // themeColor / background_color are PWA manifest values read by the OS shell.
      .filter((file) => {
        const path = toRepoPath(file);
        return path !== 'src/app/layout.tsx' && path !== 'src/app/manifest.ts';
      })
      .filter((file) => /#[0-9a-fA-F]{6}\b/.test(read(file)))
      .map(toRepoPath);

    expect(offenders).toEqual([]);
  });

  it('uses the radius scale', () => {
    const offenders = componentFiles.filter((file) => {
      const source = read(file);
      const radii = [...source.matchAll(/\brounded(?:-[a-z0-9]+)?\b/g)].map((m) => m[0]);
      return radii.some(
        (utility) => !/^rounded(?:-(?:xs|control|card|pill|none))?$/.test(utility),
      );
    });

    expect(offenders.map(toRepoPath)).toEqual([]);
  });

  it('replaces the focus ring instead of removing it', () => {
    const offenders = componentFiles.flatMap((file) => {
      const lines = read(file).split('\n');
      return lines.flatMap((line, index) => {
        if (!line.includes('focus:outline-none')) return [];
        const window = lines.slice(Math.max(0, index - 30), index + 4).join('\n');
        const hasReplacement =
          line.includes('focus-visible:') || window.includes('focus-within:ring');
        return hasReplacement ? [] : [`${toRepoPath(file)}:${index + 1}`];
      });
    });

    expect(offenders).toEqual([]);
  });
});
