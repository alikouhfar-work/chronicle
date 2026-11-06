/** Strict handle matcher shared by extraction and rendering. */
export const MENTION_PATTERN = /(?<![\w@])@([a-z0-9_]{3,32})(?![a-z0-9_])/gi;

const stripFencedCode = (content: string): string => {
  const lines = content.split(/\r?\n/);
  const visibleLines: string[] = [];
  let fence: { character: '`' | '~'; length: number } | null = null;

  for (const line of lines) {
    const markerRun = line.match(/^ {0,3}(`{3,}|~{3,})/)?.[1];
    if (!fence && markerRun) {
      fence = { character: markerRun[0] as '`' | '~', length: markerRun.length };
      continue;
    }

    if (fence) {
      const closingRun = line.match(/^ {0,3}(`+|~+)[ \t]*$/)?.[1];
      if (closingRun && closingRun[0] === fence.character && closingRun.length >= fence.length) {
        fence = null;
      }
      continue;
    }

    visibleLines.push(line);
  }

  return visibleLines.join('\n');
};

/** Extract unique, lowercase @handles from prose, excluding Markdown code. */
export const extractMentionHandles = (content: string): string[] => {
  const prose = stripFencedCode(content).replace(/(`+)[\s\S]*?\1/g, ' ');
  const handles = new Set<string>();

  for (const match of prose.matchAll(MENTION_PATTERN)) {
    const handle = match[1];
    if (handle) handles.add(handle.toLowerCase());
  }

  return [...handles];
};
