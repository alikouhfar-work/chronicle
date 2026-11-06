import { MENTION_PATTERN } from '@/modules/comments/lib/mentions';

export type MentionSegment =
  | { type: 'text'; value: string }
  | { type: 'mention'; handle: string; raw: string };

type Range = [start: number, end: number];

const collectFencedRanges = (content: string): Range[] => {
  const ranges: Range[] = [];
  const lines = content.split('\n');
  let offset = 0;
  let open: { character: string; length: number; start: number } | null = null;

  for (const line of lines) {
    const markerRun = line.match(/^ {0,3}(`{3,}|~{3,})/)?.[1];

    if (!open && markerRun) {
      open = { character: markerRun[0] ?? '', length: markerRun.length, start: offset };
    } else if (open) {
      const closingRun = line.match(/^ {0,3}(`+|~+)[ \t]*$/)?.[1];
      if (closingRun && closingRun[0] === open.character && closingRun.length >= open.length) {
        ranges.push([open.start, offset + line.length]);
        open = null;
      }
    }

    offset += line.length + 1;
  }

  if (open) ranges.push([open.start, content.length]);
  return ranges;
};

const collectInlineCodeRanges = (content: string): Range[] => {
  const ranges: Range[] = [];
  for (const match of content.matchAll(/(`+)[\s\S]*?\1/g)) {
    ranges.push([match.index, match.index + match[0].length]);
  }
  return ranges;
};

const isInside = (index: number, ranges: Range[]): boolean =>
  ranges.some(([start, end]) => index >= start && index < end);

/**
 * Splits comment text into plain runs and `@handle` mentions so the renderer
 * can style mentions as chips. Handles inside code blocks/spans stay literal,
 * matching the server-side mention extraction rules.
 */
export const tokenizeMentions = (content: string): MentionSegment[] => {
  const codeRanges = [...collectFencedRanges(content), ...collectInlineCodeRanges(content)];
  const segments: MentionSegment[] = [];
  let cursor = 0;

  for (const match of content.matchAll(MENTION_PATTERN)) {
    const start = match.index;
    if (isInside(start, codeRanges)) continue;

    if (start > cursor) {
      segments.push({ type: 'text', value: content.slice(cursor, start) });
    }

    const handle = match[1];
    if (!handle) continue;
    segments.push({ type: 'mention', handle: handle.toLowerCase(), raw: match[0] });
    cursor = start + match[0].length;
  }

  if (cursor < content.length) {
    segments.push({ type: 'text', value: content.slice(cursor) });
  }

  return segments;
};
